# Python bytecode 2.7 (decompiled from Python 2.7)
# Embedded file name: wotbox_plugin_launcher.py
# Compiled at: 2014-11-07 16:33:06


def load_wotbox_mods():
    import ResMgr, os, glob
    sec = ResMgr.openSection('../paths.xml')
    subsec = sec['Paths']
    vals = subsec.values()[0:2]
    for val in vals:
        mp = val.asString + '/scripts/client/mods/wotbox_mods/*.pyc'
        for fp in glob.iglob(mp):
            _, fn = os.path.split(fp)
            sn, _ = fn.split('.')
            if sn != '__init__':
                print 'LoadMod: ' + sn
                try:
                    exec 'import mods.wotbox_mods.' + sn
                except Exception as e:
                    print e


load_wotbox_mods()
