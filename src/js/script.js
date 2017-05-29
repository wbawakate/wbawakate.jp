// エントリーポイント。indexからはライブラリとこれしか呼ばない

import ns from './module/ns';
import Main from './module/Main';

ns.main = new Main();
