ARCHS = arm64 arm64e
TARGET = iphone:clang::12.0
INSTALL_TARGET_PROCESSES = Discord

include $(THEOS)/makefiles/common.mk

TWEAK_NAME = eggcrypt

eggcrypt_FILES = Tweak.xm
eggcrypt_CFLAGS = -fobjc-arc
eggcrypt_FRAMEWORKS = JavaScriptCore

include $(THEOS_MAKE_PATH)/tweak.mk
