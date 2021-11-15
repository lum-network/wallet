import dayjs from 'dayjs';
import utcPlugin from 'dayjs/plugin/utc';
import relativeTimePlugin from 'dayjs/plugin/relativeTime';
import localizedFormatPLugin from 'dayjs/plugin/localizedFormat';

dayjs.extend(utcPlugin);
dayjs.extend(relativeTimePlugin);
dayjs.extend(localizedFormatPLugin);

export const dateFromNow = (date: dayjs.ConfigType, withoutSuffix = false): string => {
    return dayjs.utc(date).fromNow(withoutSuffix);
};

export const toLocaleDateFormat = (date: dayjs.ConfigType): string => dayjs.utc(date).format('lll');
