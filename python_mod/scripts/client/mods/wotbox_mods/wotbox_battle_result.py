from wotbox_plugin_logger import *
from PlayerEvents import g_playerEvents
import copy
import BigWorld
import threading
from Queue import Queue
from Avatar import PlayerAvatar
from functools import partial
from messenger.formatters.service_channel import BattleResultsFormatter
import json
from datetime import datetime, date
from decimal import Decimal
from types import FunctionType

DEBUG('success111')

battleCache = {}


def serialize(obj):
    """JSON serializer for objects not serializable by default json code"""
    if isinstance(obj, (datetime, date)):
        return obj.isoformat()
    elif isinstance(obj, Decimal):
        return float(obj)
    elif isinstance(obj, bytes):
        return obj.decode('utf-8')
    elif isinstance(obj, set):
        return list(obj)
    elif isinstance(obj, FunctionType):
        return "Function"
    elif hasattr(obj, '__dict__'):
        return obj.__dict__
    else:
        return str(obj)

def to_json(obj):
    """Convert a Python object to a JSON string, handling non-serializable attributes."""
    return json.dumps(obj, default=serialize, encoding='latin1', sort_keys=True)

class CombatlogMonitor(object):
    def __init__(self):
        self.resultFilePath = 'dadeBattleLog'
        self.start()
    
    def __del__(self):
        self.stop()

    def start(self):
        g_playerEvents.onBattleResultsReceived += self.onReceiveCombatlog

    def stop(self):
        g_playerEvents.onBattleResultsReceived -= self.onReceiveCombatlog

    def getArenaVehiclesInfo(self):
        vehicles = {}
        for k, v in BigWorld.player().arena.vehicles.iteritems():
            vehicle = copy.copy(v)
            vehicle['vehicleType'] = v['vehicleType'].name if v['vehicleType'] is not None else ''
            del vehicle['accountDBID']
            del vehicle['prebattleID']
            del vehicle['clanDBID']
            del vehicle['isPrebattleCreator']
            del vehicle['isAvatarReady']
            vehicles[k] = vehicle

        return vehicles

    def onReceiveCombatlog(self, isPlayerVehicle, results):
        try:
            print 'enter onReceiveCombatlog'
            results_copy = copy.deepcopy(results)
            print str(results_copy)
            self.__FieldProcess(results_copy)
            print str()
            self.__DelFields(results_copy)
            results_adapt = self.__FieldAdapt(results_copy)
            try:
                results_adapt['vehiclesInfo'] = self.getArenaVehiclesInfo()
                results_adapt['mapName'] = BigWorld.player().arena.arenaType.geometry
            except:
                try:
                    results_adapt['vehiclesInfo'] = battleCache[results_copy["arenaUniqueID"]]["vehicles"]
                    results_adapt['mapName'] = battleCache[results_copy["arenaUniqueID"]]["mapName"]
                except Exception as e:
                    ERROR('read from battleCache error')
                    ERROR(e)
            try:
                json_form = json.dumps(results_adapt, sort_keys=True, encoding='gb2312')
                DEBUG(json_form)
            except:
                DEBUG('[wotbox:that not is gb2312]')

            try:
                json_form = json.dumps(results_adapt, sort_keys=True, encoding='gbk')
                DEBUG(json_form)
            except:
                DEBUG('[wotbox:that not is gbk]')

            try:
                json_form = json.dumps(results_adapt, sort_keys=True)
                DEBUG(json_form)
            except:
                DEBUG('[wotbox:that not is unicode]')

            try:
                json_form = json.dumps(results_adapt, sort_keys=True, encoding='utf8')
                DEBUG(json_form)
            except:
                DEBUG('[wotbox:that not is utf8')

            try:
                json_form = json.dumps(results_adapt, sort_keys=True, ensure_ascii=False, encoding='gb2312')
                DEBUG(json_form)
            except:
                DEBUG('[wotbox:that not is gb2312 #####]')

            try:
                json_form = json.dumps(results_adapt, sort_keys=True, ensure_ascii=False, encoding='gbk')
                DEBUG(json_form)
            except:
                DEBUG('[wotbox:that not is gbk] #####]')

            try:
                json_form = json.dumps(results_adapt, sort_keys=True, ensure_ascii=False,)
            except:
                DEBUG('[wotbox:that not is unicode #####]')

            try:
                json_form = json.dumps(results_adapt, sort_keys=True, ensure_ascii=False, encoding='utf8')
                DEBUG(json_form)
            except:
                DEBUG('[wotbox:that not is utf8 again #####]')

            print 'print json_form before'
            new_results_adapt = self.convertStyle(results_adapt)
            json_form = json_form = to_json(new_results_adapt)
            # json_form = json_form = to_json(results_adapt)
            print 'print json_form:'
            self.writeJsonToFile(json_form, new_results_adapt['time'])
            # self.writeJsonToFile(json_form, results_adapt['arenaUniqueID'])
            print '[wotbox:battle result is send]'
            DEBUG('[wotbox:battle result is send]')
        except Exception as e:
                ERROR(e)
    
    def convertStyle(self, results_adapt):
        try:
            new_results_atapt = {}
            player_temp = {}
            new_results_atapt['arenaUniqueID'] = results_adapt['arenaUniqueID']
            new_results_atapt['time'] = results_adapt['common']['arenaCreateTime']
            new_results_atapt['winTeam'] = results_adapt['common']['winnerTeam']
            new_results_atapt['duration'] = results_adapt['common']['duration']
            new_results_atapt['mapName'] = results_adapt['mapName']
            new_results_atapt['leftTeam'] = results_adapt['personal']['team']
            new_results_atapt['hostUserId'] = results_adapt['personal']['accountDBID']
            if 'bpTopPoints' in results_adapt['personal']:
                new_results_atapt['bpPointsByRank'] = results_adapt['personal']['bpTopPoints']
            if 'eventBattlePassPoints' in results_adapt['personal']:
                new_results_atapt['bpPointsByEvent'] = results_adapt['personal']['eventBattlePassPoints']
            new_results_atapt['freeXp'] = results_adapt['personal']['freeXP']
            for playerId in results_adapt['players']:
                if playerId not in player_temp:
                    player_temp[playerId] = {}
                player_temp[playerId]['realName'] = results_adapt['players'][playerId]['realName']
                if results_adapt['players'][playerId]['team'] == results_adapt['personal']['team']:
                    player_temp[playerId]['team'] = 'left'
                else:
                    player_temp[playerId]['team'] = 'right'
            for teamItemId in results_adapt['vehicles']:
                tempId = results_adapt['vehicles'][teamItemId][0]['accountDBID']
                player_temp[tempId]['accountDBID'] = results_adapt['vehicles'][teamItemId][0]['accountDBID']
                player_temp[tempId]['damageBlockedByArmor'] = results_adapt['vehicles'][teamItemId][0]['damageBlockedByArmor']
                player_temp[tempId]['damageDealt'] = results_adapt['vehicles'][teamItemId][0]['damageDealt']
                player_temp[tempId]['damageAssistedRadio'] = results_adapt['vehicles'][teamItemId][0]['damageAssistedRadio']
                player_temp[tempId]['damageAssistedTrack'] = results_adapt['vehicles'][teamItemId][0]['damageAssistedTrack']
                player_temp[tempId]['damageReceived'] = results_adapt['vehicles'][teamItemId][0]['damageReceived']
                player_temp[tempId]['shots'] = results_adapt['vehicles'][teamItemId][0]['shots']
                player_temp[tempId]['directEnemyHits'] = results_adapt['vehicles'][teamItemId][0]['directEnemyHits']
                player_temp[tempId]['piercingEnemyHits'] = results_adapt['vehicles'][teamItemId][0]['piercingEnemyHits']
                player_temp[tempId]['damaged'] = results_adapt['vehicles'][teamItemId][0]['damaged']
                player_temp[tempId]['damagedHp'] = results_adapt['vehicles'][teamItemId][0]['damagedHp']
                player_temp[tempId]['kills'] = results_adapt['vehicles'][teamItemId][0]['kills']
                player_temp[tempId]['directHitsReceived'] = results_adapt['vehicles'][teamItemId][0]['directHitsReceived']
                player_temp[tempId]['piercingsReceived'] = results_adapt['vehicles'][teamItemId][0]['piercingsReceived']
                player_temp[tempId]['noDamageDirectHitsReceived'] = results_adapt['vehicles'][teamItemId][0]['noDamageDirectHitsReceived']
                player_temp[tempId]['potentialDamageReceived'] = results_adapt['vehicles'][teamItemId][0]['potentialDamageReceived']
                player_temp[tempId]['explosionHitsReceived'] = results_adapt['vehicles'][teamItemId][0]['explosionHitsReceived']
                player_temp[tempId]['deathCount'] = results_adapt['vehicles'][teamItemId][0]['deathCount']
                player_temp[tempId]['spotted'] = results_adapt['vehicles'][teamItemId][0]['spotted']
                player_temp[tempId]['capturePoints'] = results_adapt['vehicles'][teamItemId][0]['capturePoints']
                player_temp[tempId]['droppedCapturePoints'] = results_adapt['vehicles'][teamItemId][0]['droppedCapturePoints']
                player_temp[tempId]['stunDuration'] = results_adapt['vehicles'][teamItemId][0]['stunDuration']
                player_temp[tempId]['stunNum'] = results_adapt['vehicles'][teamItemId][0]['stunNum']
                player_temp[tempId]['xp'] = results_adapt['vehicles'][teamItemId][0]['xp']
                player_temp[tempId]['credits'] = results_adapt['vehicles'][teamItemId][0]['credits']
                player_temp[tempId]['isAlive'] = results_adapt['vehiclesInfo'][teamItemId]['isAlive']
                player_temp[tempId]['tankId'] = results_adapt['vehiclesInfo'][teamItemId]['vehicleType']
            for playerIdAgain in player_temp:
                if playerIdAgain == results_adapt['personal']['accountDBID']:
                    new_results_atapt['mine'] = player_temp[playerIdAgain]
            new_results_atapt['players'] = player_temp
            return new_results_atapt
        except Exception as e:
            ERROR(e)

    def __DelFields(self, results):
        persion_del_fields = [
            # 'details',
            # 'creditsReplay',
            # 'fortResourceReplay',
            # 'tmenXPReplay',
            # 'xpPenalty',
            # 'xpReplay',
            # 'goldReplay',
            # 'freeXPReplay',
            # 'dossierPopUps',
            # 'xpByTmen',
            # 'autoLoadCost',
            # 'autoEquipCost',
            # 'crystalReplay',
            # 'c11nProgress',
            # 'avatarDamageEventList',
            # 'questsProgress',
            # 'fairplayViolations',
            # 'activeRents',
            # 'badges'
        ]
        for personal_typeCompDescr in results['personal']:
            for field in persion_del_fields:
                if field in results['personal'][personal_typeCompDescr]:
                    results['personal'][personal_typeCompDescr].pop(field)

        print 'del details'

    def __FieldAdapt(self, results):
        results_atapt = {}
        if 'arenaUniqueID' in results:
            results_atapt['arenaUniqueID'] = results['arenaUniqueID']
            print 'compy arenaUniqueID'
        if 'common' in results:
            results_atapt['common'] = results['common']
            print 'compy common'
        if 'uniqueSubUrl' in results:
            results_atapt['uniqueSubUrl'] = results['uniqueSubUrl']
            print 'compy uniqueSubUrl'
        if 'players' in results:
            results_atapt['players'] = results['players']
            print 'compy players'
        if 'personal' in results:
            for personal_typeCompDescr in results['personal']:
                personalValue = results['personal'].pop(personal_typeCompDescr)
                if 'eventXP' in personalValue:
                    results_atapt['personal'] = personalValue
                    print '[wotbox:personal is ]--%s' % str(results_atapt['personal'])
                    break
            print 'compy personal'
        if 'vehicles' in results:
            # vehicles_map = {}
            # for tanke_id in results['vehicles']:
            #     vehicles_map[tanke_id] = results['vehicles'][tanke_id][0]
            results_atapt['vehicles'] = results['vehicles']
            print 'compy vehicles'
        return results_atapt

    def __FieldProcess(self, results):
        if isinstance(results, dict):
            for key in results.keys():
                key_value = results.get(key)
                if isinstance(key_value, dict):
                    self.__FieldProcess(key_value)
                if isinstance(key_value, list):
                    for json_array in key_value:
                        self.__FieldProcess(json_array)

                if isinstance(key_value, set):
                    print str(key) + ' = ' + str(key_value)
                    results.pop(key)

        elif isinstance(results, list):
            for input_json_array in results:
                self.__FieldProcess(input_json_array)

    def writeJsonToFile(self, json_data, id):
        with open('{}/{}.txt'.format(self.resultFilePath, id), 'w') as f:
            f.write(json_data)

class BattleResultParser(object):
    def __init__(self):
        try:
            self.Threads = True
            self.ArenaIDQueue = Queue()
            self.ResultsCache = []
            self.ResultsAvailable = threading.Event()
            self.thread = threading.Thread(target=self.WaitResult)
            self.thread.setDaemon(True)
            self.thread.setName('WaitResult')
            self.thread.start()
        except Exception as e:
            ERROR('__init__')
            ERROR(e)

    def CheckCallback(self, ArenaUniqueID, ErrorCode, battleResults):
        try:
            if ErrorCode in [-3, -5]:
                BigWorld.callback(1.0, lambda: self.ArenaIDQueue.put(ArenaUniqueID))
            elif ErrorCode >= 0:
                if ArenaUniqueID in self.ResultsCache: return
                combatlog_monitor.onReceiveCombatlog(True, battleResults)
                # print battleResults.get('arenaUniqueID')
                # print battleResults.get('personal')
                # print battleResults.get('common')
        except Exception as e:
            ERROR('CheckCallback')
            ERROR(e)

    def WaitResult(self):
        while self.Threads:
            ArenaUniqueID = self.ArenaIDQueue.get()
            self.ResultsAvailable.wait()
            try:
                BigWorld.player().battleResultsCache.get(ArenaUniqueID, partial(self.CheckCallback, ArenaUniqueID))
            except Exception as e:
                ERROR('WaitResult')
                ERROR(e)
                pass


def hook_BattleResultsFormatter_format(self, message, *args):
    arenaUniqueID = message.data.get('arenaUniqueID', 0)
    bresults.ArenaIDQueue.put(arenaUniqueID)
    return hooked_BattleResultsFormatter_format(self, message, *args)

def onAccountBecomePlayer():
    bresults.ResultsAvailable.set()

def IntoBattle():
    try:
        battleCache[BigWorld.player().arena.arenaUniqueID] = {
            "mapName": BigWorld.player().arena.arenaType.geometry,
            "vehicles": combatlog_monitor.getArenaVehiclesInfo()
        }
    except Exception as e:
        ERROR('IntoBattle')
        ERROR(e)
    bresults.ResultsAvailable.clear()

def fini():
    bresults.Threads = False

combatlog_monitor = CombatlogMonitor()
bresults = BattleResultParser()

hooked_BattleResultsFormatter_format = BattleResultsFormatter.format

BattleResultsFormatter.format = hook_BattleResultsFormatter_format
g_playerEvents.onAvatarReady += IntoBattle
g_playerEvents.onAccountBecomePlayer += onAccountBecomePlayer
