/**
*  Copyright 2020 BrylanBristopherNFTs
*  This source file is subject to the terms and conditions of
*  THE FREE AS IN EGGCRYPT / OPEN AS IN OPENAI (FAIE/OAIO) LICENSE.
*  You may not use this file except in compliance with the License.
*/

#import "Tweak.h"
#import "china.h"

static void getKeys() {
	keys = [[NSMutableDictionary alloc] init];
	NSString *contents = [NSString stringWithContentsOfFile:profilesPath encoding:NSUTF8StringEncoding error:nil];

	if (!contents || !(contents.length > 0)){
		[DEFAULTPROFILE writeToFile:profilesPath atomically:YES encoding:NSUTF8StringEncoding error:nil];
		contents = DEFAULTPROFILE;
	}

	[contents enumerateLinesUsingBlock:^(NSString *line, BOOL *stop){
		NSArray *comp = [line componentsSeparatedByString:@"::"];
		if([comp count] < 3) return;
		unsigned hex = 0;
		NSScanner *scanner = [NSScanner scannerWithString:comp[2]];
		[scanner setScanLocation:1];
		[scanner scanHexInt:&hex];
		UIColor *color = UIColorFromRGB(hex);
		keys[comp[0]] = @[ comp[1], color ];
	}];
}

static void doEval() {
	if (!evalCtx) evalCtx = [[JSContext alloc] init];
	textView.text = [[evalCtx evaluateScript:[textView.text substringFromIndex:4]] toString];
}

static void doEncrypt() {
	if ([textView.text hasPrefix:@"/n "]) {
		textView.text = [textView.text substringFromIndex:3];
		return;
	}

	if ([textView.text hasPrefix:@"/ev "]) {
		doEval();
	} else if([textView.text isEqualToString:@"/egg"]) { textView.text = @"```\n        `.---`            \n      -/oooooo+-          \n    `/oooooooooo+-        \n   .oooooooooooooo:       \n  `oooooooooooooooo:      \n  +ooooooooooooooooo-     \n -oooooooooooooooooo+     \n +ooooooooooooooooooo-    \n oooooooooooooooooooo:    \n oooooooooooooooooooo:    \n /ooooooooooooooooooo.    \n `+ooooooooooooooooo:     \n  `+ooooooooooooooo:      \n    -+ooooooooooo/`       \n      `.:////:-.          \n```"; return; }
	
	if (!currentKey || [textView.text hasPrefix:ENCPREFIX] || !(textView.text.length > 0)) return;

	textView.text = china::encrypt(textView.text, currentKey);
}

%hook DCDChatInput

-(id)init{
	id r = %orig;
	textView = r;
	return r;
}

%end

%hook DCDMessageTableViewCell

- (id)processContent:(__kindof NSAttributedString *)content message:(id)msg {
	if (content && [[content string] hasPrefix:ENCPREFIX]){
		if ([encryptedCache objectForKey:msg[@"id"]]){
			content = [encryptedCache objectForKey:msg[@"id"]];
		} else {
			NSString *decrypted = nil;
			UIColor *color = nil;
			NSArray *parts = [content.string componentsSeparatedByString:@"俿"];

			if (parts.count == 4) {
				NSData *salt = china::decodecn1t(parts[1]);
				NSData *iv = china::decodecn1t(parts[2]);
				NSData *encrypted = china::decodecn1t(parts[3]);
				if (salt && iv && encrypted) {
					for (id k in keys){
						NSData *key = china::derive(keys[k][0], salt);
						decrypted = china::decrypt(key, iv, encrypted);
						if (decrypted) {
							color = keys[k][1];
							break;
						}
					}
				}
			}

			NSMutableDictionary *att = [[content attributesAtIndex:0 effectiveRange:NULL] mutableCopy];
			if (decrypted && decrypted.length > 0) {
				att[NSForegroundColorAttributeName] = color;
				[content setAttributedString:[[NSAttributedString alloc] initWithString:decrypted attributes:att]];
			} else {
				att[NSForegroundColorAttributeName] = UIColor.redColor;
				[content setAttributedString:[[NSAttributedString alloc] initWithString:[content.string stringByAppendingString:@"\n[UNABLE TO DECRYPT]"] attributes:att]];
			}

			[encryptedCache setObject:content forKey:msg[@"id"] cost:content.string.length];
		}
	}

	return %orig(content, msg);
}

%end

%hook RCTView

-(void)addSubview:(id)v {
	%orig;
	if([v isKindOfClass:%c(RCTImageView)]){
		RCTImageView *view = (RCTImageView *)v;
		if([[view imageSources] count] == 0) return;
		NSString *component = [[view imageSources][0] request].URL.lastPathComponent;
		if([component hasPrefix:@"ic_send"]) {
			UITapGestureRecognizer *tg =  [[UITapGestureRecognizer alloc] initWithTarget:self action:@selector(ECGo)];
			[self addGestureRecognizer:tg];
		} else if([component hasPrefix:@"ic_gift"]) {
			UILongPressGestureRecognizer *lp =  [[UILongPressGestureRecognizer alloc] initWithTarget:self action:@selector(ECProfile)];
			[self addGestureRecognizer:lp];
		}
	}
}

%new

-(void)ECGo {
	doEncrypt();
}

%new

-(void)ECProfile {
	getKeys();

	UIViewController *vc = [[UIApplication sharedApplication] keyWindow].rootViewController;
	UIAlertController* alert = [UIAlertController alertControllerWithTitle:@"Select EggCrypt Profile"
                           message:nil
                           preferredStyle:UIAlertControllerStyleActionSheet];
 

 	alert.popoverPresentationController.sourceView = textView;
    alert.popoverPresentationController.sourceRect = textView.bounds;
		
	for (NSString *k in keys){
		UIAlertAction* action = [UIAlertAction actionWithTitle:k style:UIAlertActionStyleDefault
			handler:^(UIAlertAction * action) {
				currentKey = keys[k][0];
				textView.textColor = keys[k][1];
				currentTextColor = textView.textColor;
			}];

		[action setValue:keys[k][1] forKey:@"titleTextColor"];
		[alert addAction:action];	
	}


	UIAlertAction* npAction = [UIAlertAction actionWithTitle:@"★ New Profile" style:UIAlertActionStyleDefault
			handler:^(UIAlertAction * action) {
				[self ECNewProfile];
			}];

	[alert addAction:npAction];	


	UIAlertAction *cancelAction = [UIAlertAction actionWithTitle:@"Disable" style:UIAlertActionStyleCancel
			handler:^(UIAlertAction * action) {
				currentKey = nil;
				textView.textColor = [%c(DCDThemeColor) TEXT_NORMAL];
				currentTextColor =  textView.textColor;
			}];

	[alert addAction:cancelAction];	

	
	[vc presentViewController:alert animated:YES completion:nil];

}

%new


-(void)ECNewProfile {
	UIViewController *vc = [[UIApplication sharedApplication] keyWindow].rootViewController;
	UIAlertController *alert = [UIAlertController alertControllerWithTitle:@"Enter Profile Information" message:@"Info must not contain 2 consecutive colons (::)" preferredStyle:UIAlertControllerStyleAlert];

    [alert addTextFieldWithConfigurationHandler:^(UITextField *textField) {
       textField.placeholder = @"Name";
    }];

    [alert addTextFieldWithConfigurationHandler:^(UITextField *textField) {
       textField.placeholder = @"Encryption Key";
    }];

    [alert addTextFieldWithConfigurationHandler:^(UITextField *textField) {
       textField.placeholder = @"Color (#RRGGBB)";
    }];

	UIAlertAction *addAction = [UIAlertAction actionWithTitle:@"Add Profile" style:UIAlertActionStyleDefault
			handler:^(UIAlertAction * action) {

				if(!(alert.textFields[0].text.length > 0) || !(alert.textFields[1].text.length > 0) || ![alert.textFields[2].text hasPrefix:@"#"] || keys[alert.textFields[0].text]){
					UIAlertController *err = [UIAlertController alertControllerWithTitle:@"Error" message:@"Invalid or missing data" preferredStyle:UIAlertControllerStyleAlert];
					UIAlertAction *cancelAction = [UIAlertAction actionWithTitle:@"Close" style:UIAlertActionStyleCancel
						handler:^(UIAlertAction * action) {}];

					[err addAction:cancelAction];
					[vc presentViewController:err animated:YES completion:nil];	
					return;
				}

				NSString *contents = [NSString stringWithContentsOfFile:profilesPath encoding:NSUTF8StringEncoding error:nil];
				if(![contents hasSuffix:@"\n"]) contents = [contents stringByAppendingString:@"\n"];

				contents = [NSString stringWithFormat:@"%@%@::%@::%@", contents, alert.textFields[0].text, alert.textFields[1].text, alert.textFields[2].text];
				[contents writeToFile:profilesPath atomically:YES encoding:NSUTF8StringEncoding error:nil];

				[self ECProfile];
			}];

	[alert addAction:addAction];	

	UIAlertAction *cancelAction = [UIAlertAction actionWithTitle:@"Cancel" style:UIAlertActionStyleCancel
			handler:^(UIAlertAction * action) {}];

	[alert addAction:cancelAction];	

	[vc presentViewController:alert animated:YES completion:nil];
}

%end


%ctor {
	encryptedCache = [[NSCache alloc] init];
	encryptedCache.countLimit = 100;
	encryptedCache.totalCostLimit = 4100;

	profilesPath = [[NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, YES) lastObject] stringByAppendingPathComponent:@"EggCryptProfiles.txt"];
	getKeys();
}
