/**
 * md5
 *
 * Created by Chenjr on 2016/04/20.
 */

'use strict';

const crypto = require('crypto');

class Md5Util {

    static getMd5(str) {
        let content = str || 'password',
            md5 = crypto.createHash('md5');

        md5.update(content);
        return md5.digest('hex');
    }
}
module.exports = Md5Util;