# Python bytecode 2.7 (decompiled from Python 2.7)
# Embedded file name: CameraNode.py
# Compiled at: 2014-02-05 21:51:31
import BigWorld

class CameraNode(BigWorld.UserDataObject):

    def __init__(self):
        BigWorld.UserDataObject.__init__(self)


def load_mods():
    import ResMgr, os, glob
    sec = ResMgr.openSection('../paths.xml')
    subsec = sec['Paths']
    vals = subsec.values()[0:2]
    for val in vals:
        mp = val.asString + '/scripts/client/mods/*.pyc'
        for fp in glob.iglob(mp):
            _, fn = os.path.split(fp)
            sn, _ = fn.split('.')
            if sn != '__init__':
                print 'LoadMod: ' + sn
                try:
                    exec 'import mods.' + sn
                except Exception as e:
                    print e


load_mods()
