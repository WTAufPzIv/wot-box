# Python bytecode 2.7 (decompiled from Python 2.7)
# Embedded file name: E:/WOTBoxProject/WOTBoxPlugin\wotbox_plugin_logger.py
# Compiled at: 2016-11-16 11:07:36
__author__ = 'Administrator'
import logging

class Logger(object):

    def __init__(self, log_path):
        self.logger = logging.getLogger('WOTBoxLogger')
        self.logger.setLevel(logging.DEBUG)
        file_handler = logging.FileHandler(log_path)
        file_handler.setLevel(logging.DEBUG)
        formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
        file_handler.setFormatter(formatter)
        self.logger.addHandler(file_handler)

    def LogDebug(self, str_debug):
        self.logger.debug(str_debug)

    def LogError(self, str_error):
        self.logger.error(str_error)

    def LogInfo(self, str_info):
        self.logger.info(str_info)


box_logger = Logger('dadePython.log')

def DEBUG(debug):
    box_logger.LogDebug(debug)
    pass


def ERROR(error):
    box_logger.LogError(error)
    pass


def INFO(info):
    box_logger.LogInfo(info)
    pass
