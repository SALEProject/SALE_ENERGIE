var moment = require('moment');
/*
moment.lang('ro', {
    months : "Ianuarie_Februarie_Martie_Aprilie_Mai_Iunie_Iulie_August_Septembrie_Octombrie_Noiembrie_Decembrie".split("_"),
    monthsShort : "Ian_Feb_Mar_Apr_Mai_Iun_Iul_Aug_Sept_Oct_Noi_Dec".split("_"),
    weekdays : "duminica_luni_marti_miercuri_joi_vineri_sambata".split("_"),
    weekdaysShort : "dum_lun_mar_mie_joi_vin_sam".split("_"),
    weekdaysMin : "Du_Lu_Ma_Mi_Jo_Vi_Sa".split("_"),
    longDateFormat : {
        LT : "HH:mm",
        L : "DD/MM/YYYY",
        LL : "D MMMM YYYY",
        LLL : "D MMMM YYYY LT",
        LLLL : "dddd D MMMM YYYY LT"
    },
    calendar : {
        sameDay: "[Azi la] LT",
        nextDay: '[Maine la] LT',
        nextWeek: 'dddd [la] LT',
        lastDay: '[Ieri la] LT',
        lastWeek: 'dddd [in urma cu] LT',
        sameElse: 'L'
    },
    relativeTime : {
        future : "in %s",
        past : "de %s",
        s : "cateva secunde",
        m : "un minut",
        mm : "%d minute",
        h : "o ora",
        hh : "%d ore",
        d : "o zi",
        dd : "%d zile",
        M : "o luna",
        MM : "%d luni",
        y : "un an",
        yy : "%d ani"
    },
    ordinal : function (number) {
        return number + (number === 1 ? 'lea' : 'a');
    },
    week : {
        dow : 1, // Monday is the first day of the week.
        doy : 4  // The week that contains Jan 4th is the first week of the year.
    }
});
*/
exports.formatDate = function(date,format) {
	return moment(date).format(format);
};
