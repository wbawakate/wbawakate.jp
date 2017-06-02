// エントリーポイント。indexからはライブラリとこれしか呼ばない

import ns from './module/ns';
import Main from './module/main';

ns.main = new Main();
