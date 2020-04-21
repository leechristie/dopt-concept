class BitStrings {

    format(candidate) {
        if (candidate === undefined) {
            return '';
        }
        let str = '[';
        for (let i = 0; i < candidate.length; i++) {
            if (i > 0) {
                str += ', ';
            }
            str += Number(candidate[i]) ? '1' : '0';
        }
        return str + ']';
    }

}

export default new BitStrings();
