BIG-BALL Portable ⚽⚾
========================
**大球 會員手持版📱⚡ 前端**

🕮 Dependencies
----------------------
Item|Version
----|-------
[Angular](https://github.com/angular/angular)             | ^5.1.0
[Angular CLI](https://github.com/angular/angular-cli)     | ~1.6.3
[TypeScript](https://github.com/Microsoft/TypeScript)     | ~2.4.2
[ReactiveX JS](https://github.com/ReactiveX/rxjs)         | ~5.5.0

Item|Version
----|-------
[NGX-Translate](http://www.ngx-translate.com/)            | ^9.0.2
[Moment JS](https://momentjs.com/)                        | ^2.19.0
[Socket.IO Client](https://socket.io/)                    | ^2.0.0

📂 Directory
------------
building ...
```
  ├── node_modules          npm Node 模組
  ├── src
  │   ├── app               應用程式
  │   ├── assets            檔案庫 (通常放置圖片)
  │   ├── environments      環境設定
  │   ├── bootstrap.js      起始設定
  │   ├── index.html
  │   ├── main.ts           應用程式起始
  │   ├── polyfills.ts      瀏覽器補充包
  │   ├── style-mobile.scss 手機樣式重設
  │   ├── style-reset.scss  樣式重設
  │   └── typings.d.ts      TypeScript 定義檔
  │
  ├── .angular-cli.json     Angular CLI 設定
  ├── .editorconfig         EditorConfig 套件設定
  ├── .gitignore            Git 版控忽略設定
  ├── package.json          npm 設定
  ├── proxy1.config.json    Proxy 設定一
  ├── proxy2.config.json    Proxy 設定二
  ├── tsconfig.json         TypeScript 設定
  ├── tslint.json           TSList 套件設定
  └── README.md             提醒文檔(本文)
```

📂 Application Directory
------------------------
building ...
```bash
  ├── app
  │   ├── core 核心(模組)
  │   │   ├── footer     頁尾選單 (元件)
  │   │   ├── login      登入頁面 (元件)
  │   │   ├── api.service.ts        API (服務)
  │   │   ├── auth.service.ts       登入驗證 (服務)
  │   │   ├── auth-guard.service.ts 路由驗證 (服務)
  │   │   ├── store-member.service.ts     會員資料 (服務)
  │   │   ├── storage.service.ts    暫存資料 (服務)
  │   │
  │   ├── shared 共用(模組)
  │   │   ├──
  │   │
  │   ├── lobby 遊戲大廳 (模組)
  │   │   ├──
  └──
```

✒️ Visual Studio Code
---------------------
### Expansion
* [TSList](https://marketplace.visualstudio.com/items?itemName=eg2.tslint)
* [Code Spell Checker](https://marketplace.visualstudio.com/items?itemName=streetsidesoftware.code-spell-checker)
* [EditorConfig](https://marketplace.visualstudio.com/items?itemName=EditorConfig.EditorConfig)


### General Setting
```
"editor.tabSize": 2,
"editor.formatOnSave": true,
"editor.formatOnPaste": true,

"tslint.enable": true,
"tslint.autoFixOnSave": true,

"files.trimTrailingWhitespace": true,

"scss.lint.duplicateProperties": "warning",
"scss.lint.zeroUnits": "warning",
"scss.lint.idSelector": "warning",
"scss.lint.important": "warning",
```
