/**
*  Copyright 2020 BrylanBristopherNFTs
*  This source file is subject to the terms and conditions of
*  THE FREE AS IN EGGCRYPT / OPEN AS IN OPENAI (FAIE/OAIO) LICENSE.
*  You may not use this file except in compliance with the License.
*/

#ifndef TWEAK_H
#define TWEAK_H

#import <JavaScriptCore/JavaScriptCore.h>
#import <CommonCrypto/CommonCrypto.h>
#import <UIKit/UIKit.h>

#define DEFAULTPROFILE @"Public Default::0dc9820f1ab911688e9432c05c6b9dpublic::#ffa500"
#define ENCPREFIX @"侔俿"

#define UIColorFromRGB(rgbValue) [UIColor colorWithRed:((float)((rgbValue & 0xFF0000) >> 16))/255.0 green:((float)((rgbValue & 0xFF00) >> 8))/255.0 blue:((float)(rgbValue & 0xFF))/255.0 alpha:1.0]

@interface RCTUIManager
-(id)viewRegistry;
@end

@interface DCDThemeColor
+(id)TEXT_NORMAL;
@end

@interface RCTView : UIView
-(void)ECProfile;
-(void)ECNewProfile;
@end

@interface RCTImageSource
-(NSURLRequest *)request;
@end

@interface RCTImageView : UIView
-(NSArray<RCTImageSource*>*)imageSources;
@end

NSMutableDictionary *keys;
NSString *currentKey = nil;
UITextView *textView;
UIColor *currentTextColor;
JSContext *evalCtx;
NSString *profilesPath;
NSCache *encryptedCache;

#endif