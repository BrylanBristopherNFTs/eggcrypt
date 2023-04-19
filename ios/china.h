/**
*  Copyright 2021 BrylanBristopherNFTs
*  This source file is subject to the terms and conditions of
*  THE FREE AS IN EGGCRYPT / OPEN AS IN OPENAI (FAIE/OAIO) LICENSE.
*  You may not use this file except in compliance with the License.
*/

#ifndef XIC_SC_I
#define XIC_SC_I

#include "traditional.h"
#include <CommonCrypto/CommonCrypto.h>

#define CN1_SALTLEN 8
#define CN1_ROUNDS 50000

namespace china
{
    namespace detail
    {
        static void hope(int s)
        {
            if (s != kCCSuccess)
            {
                abort();
            }
        }

        static NSData *randbytes(size_t len)
        {
            NSMutableData *data = [NSMutableData dataWithLength:len];
            hope(CCRandomGenerateBytes([data mutableBytes], len));
            return data;
        }

        static NSData *cbc128(NSData *input, NSData *key, NSData *iv)
        {
            NSMutableData *result = [NSMutableData dataWithLength:([input length] + kCCBlockSizeAES128)];
            size_t reslen;

            hope(
                CCCrypt(
                    kCCEncrypt,
                    kCCAlgorithmAES128,
                    kCCOptionPKCS7Padding,
                    [key bytes], [key length],
                    [iv bytes],
                    [input bytes], [input length],
                    [result mutableBytes], [result length],
                    &reslen));

            [result setLength:reslen];
            return result;
        }
    }

    NSString *encodecn1t(NSData *data)
    {
        static NSString *const stc[256] = CN1_T_C;

        NSMutableString *out = [NSMutableString stringWithCapacity:[data length] * 2];
        const unsigned char *bytes = (const unsigned char *)[data bytes];

        for (int i = 0; i < [data length]; i++)
        {
            [out appendString:stc[bytes[i]]];
        }
        return out;
    }

    NSData *decodecn1t(NSString *china)
    {
        static NSDictionary *const stlo = CN1_T_L;

        NSMutableData *out = [NSMutableData dataWithCapacity:[china length]];

        for (int i = 0; i < [china length]; i++)
        {
            NSNumber *num = [stlo objectForKey:[china substringWithRange:NSMakeRange(i, 1)]];

            if (!num)
                return nil;

            char byte = [num charValue];
            [out appendBytes:&byte length:1];
        }

        return out;
    }

    NSData *derive(NSString *password, NSData *salt)
    {
        uint8_t key[kCCKeySizeAES128];

        detail::hope(
            CCKeyDerivationPBKDF(kCCPBKDF2,
                                 [password UTF8String],
                                 [password lengthOfBytesUsingEncoding:NSUTF8StringEncoding],
                                 (uint8_t *)[salt bytes], CN1_SALTLEN,
                                 kCCPRFHmacAlgSHA256, CN1_ROUNDS,
                                 key, kCCKeySizeAES128));

        return [NSData dataWithBytes:key length:kCCKeySizeAES128];
    }

    NSString *encrypt(NSString *input, NSString *password)
    {
        NSData *salt = detail::randbytes(CN1_SALTLEN);
        NSData *iv = detail::randbytes(kCCBlockSizeAES128);
        NSData *key = derive(password, salt);

        NSData *inputbytes = [input dataUsingEncoding:NSUTF8StringEncoding];
        NSData *ciphertext = detail::cbc128(inputbytes, key, iv);

        NSArray *parts = @[
            @"侔",
            encodecn1t(salt),
            encodecn1t(iv),
            encodecn1t(ciphertext)
        ];

        return [parts componentsJoinedByString:@"俿"];
    }

    NSString *decrypt(NSData *key, NSData *iv, NSData *ciphertext)
    {
        NSMutableData *result = [NSMutableData dataWithLength:([ciphertext length] + kCCBlockSizeAES128)];
        size_t reslen;

        CCCryptorStatus status = CCCrypt(
            kCCDecrypt,
            kCCAlgorithmAES128,
            kCCOptionPKCS7Padding,
            [key bytes], [key length],
            [iv bytes],
            [ciphertext bytes], [ciphertext length],
            [result mutableBytes], [result length],
            &reslen);

        if (status != kCCSuccess)
        {
            return nil;
        }

        [result setLength:reslen];
        return [[NSString alloc] initWithData:result encoding:NSUTF8StringEncoding];
    }
}

#endif