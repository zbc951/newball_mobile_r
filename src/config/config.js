var _DEFAULT = {
    // 預設語系
    LANG: 'zh-tw',
    // 預設球種  每季會改球種
    BALL: 'BK',
    // 0 信用, 1 現金
    TYPE: 0,
    // 最低下注額 (大陸20，其餘100)
    MIN_BET: 100,
    // 是否由外站登入
    isCashVer: false,
    // 後端位置
    SERVER_PATH: '/pub/gateway.php',
    // 聊天後端位置

    // CHAT_SERVER: 'http://voice-demo.sog88.net:5000',
    CHAT_SERVER: 'https://i88-chat.cn8998.net:5003',
    // CHAT_SERVER: 'http://voice-demo.sog88.net:5003',
    // CHAT_SERVER: '127.0.0.1:5000',
    CHAT_SERVER_HTTPS: 'https://i88-chat.cn8998.net:5003',
    // 分 http  https
    CHAT_SERVER_TYPE: 'http',

    // 影片位置
    VIDEO_PATH: 'https://shls.nk998.net:8880/m3u8/',

    //影城連結
    MOVIE_PATH: '../../app/GoldClass/index.php',
    //是否顯示影城連結
    HAS_MOVIE: true,

    //是否為中國版
    isCN: false,

    //是否有波膽玩法
    hasPD: true,

    //真人是否開啟
    isRealOpen: false,

    //TC老虎機是否開啟
    isTCOpen: false,

    //世界盃32選8玩法是否開啟
    isPick8Enable: false,

    //世界盃32選8玩法是否開放下注
    isPick8Open: false,
    
    //是否顯示規則頁
    HAS_RULE: true,

    //不要顯示的球種
    LimitTypes: [],

    //直播名稱
    liveST: 'com',

    // 影片位置 雷速  單數小時走這個
    VIDEO_PATH_leisu_1: 'https://n2hls.nk998.net:8880/m3u8/',
    // 影片位置 雷速 雙數小時走這個
    VIDEO_PATH_leisu_2: 'https://n3hls.nk998.net:8880/m3u8/',
    //使用的是新的直播視訊'https://snhls.nk998.net:8880/m3u8/' 雷速訊號.VIDEO_leisu=true 跑221  舊訊號 false 跑211 false 跑211
    VIDEO_leisu: true,
    
    //是否為香港盤
    HKO: true,

    //夜間模式
    NIGHT_MODE: false,

    //新手版-專業版
    BEGINNER: true,
    //聯盟-時間-排序
    LENGHT: true,


}

// 讀取站台config檔案資料

try {
    _DEFAULT.LANG = Default_lang;
} catch (e) {}
try {
    _DEFAULT.isCashVer = !credit;
} catch (e) {}
try {
    //[真人,TC老虎機,遊戲館帳戶歷史,影城,新直播,六合,賓果,直播(舊),遊戲, 規則]
    //  0      1          2        3     4    5    6     7      8     9
    _DEFAULT.isRealOpen = topbutton[0];
    _DEFAULT.isTCOpen = topbutton[1];
    _DEFAULT.HAS_MOVIE = topbutton[3];
    _DEFAULT.HAS_RULE = topbutton[9] !== false;
} catch (e) {}
try {
    _DEFAULT.MIN_BET = Default_min_money;
} catch (e) {}
try {
    _DEFAULT.CHAT_SERVER = chat_server;
    _DEFAULT.CHAT_SERVER_HTTPS = chat_server;
} catch (e) {}
try {
    _DEFAULT.VIDEO_PATH = live_addr;
} catch (e) {}
try {
    _DEFAULT.VIDEO_PATH_leisu_1 = live_addr_leisu_1;
} catch (e) {}
try {
    _DEFAULT.VIDEO_PATH_leisu_2 = live_addr_leisu_2;
} catch (e) {}
try {
    _DEFAULT.VIDEO_leisu = live_leisu;
} catch (e) {}
try {
    _DEFAULT.hasPD = pd_open;
} catch (e) {}
try {
    _DEFAULT.isCN = is_cn;
} catch (e) {}
try {
    if (limitgtype) {
        _DEFAULT.LimitTypes = limitgtype;
    }
} catch (e) {}
try {
    if (st_id) {
        _DEFAULT.liveST = st_id + '';
    }
} catch (e) {}