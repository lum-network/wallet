import { Card } from 'frontend-elements';
import numeral from 'numeral';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Chart from 'kaktana-react-lightweight-charts';
import { UTCTimestamp } from 'lightweight-charts';
import { NumbersUtils, WalletClient } from 'utils';
import { Button } from 'components';

import './Cards.scss';

interface Props {
    balance: number;
}

const LumPriceCard = ({ balance }: Props): JSX.Element => {
    const { t } = useTranslation();
    const [chartData, setChartData] = useState<{ time: number; value: number }[]>([]);
    const [lumPrice, setLumPrice] = useState(0);
    const [previousDayPercentage, setPreviousDayPercentage] = useState(0);

    useEffect(() => {
        const data = WalletClient.lumInfos;

        if (data) {
            const chart = data.previousDaysPrices.map((value) => ({
                time: value.time as UTCTimestamp,
                value: value.close,
            }));

            setChartData(chart);
            setLumPrice(data.price);
            setPreviousDayPercentage(NumbersUtils.getDifferencePercentage(chart[0].value, data.price));
        }
    }, []);

    const onBuy = () => {
        // ON BUY
    };

    return (
        <Card withoutPadding className="h-100 dashboard-card lum-price-card justify-content-start p-4">
            <h2 className="ps-2 pt-3">{t('dashboard.lumPrice')}</h2>
            <div className="ps-2 my-3 d-flex flex-column flex-lg-row justify-content-between align-items-lg-center w-100">
                <h6 className="display-6 align-self-lg-end">{numeral(balance).format('$0.00')}</h6>
                <div className="chart">
                    <Chart
                        autoHeight
                        autoWidth
                        options={{
                            priceScale: {
                                position: 'none',
                                autoScale: true,
                            },
                            layout: {
                                textColor: '#00000000',
                                backgroundColor: '#00000000',
                            },
                            timeScale: {
                                visible: false,
                            },
                            grid: {
                                vertLines: {
                                    visible: false,
                                },
                                horzLines: {
                                    visible: false,
                                },
                            },
                            crosshair: {
                                vertLine: {
                                    visible: false,
                                    labelVisible: false,
                                },
                                horzLine: {
                                    visible: false,
                                    labelVisible: false,
                                },
                            },
                            handleScale: false,
                            handleScroll: false,
                        }}
                        areaSeries={[
                            {
                                data: chartData,
                                options: {
                                    topColor: 'rgba(118, 219, 122, 100)',
                                    bottomColor: 'rgba(118, 219, 122, 0)',
                                    lineColor: 'rgba(118, 219, 122, 100)',
                                    lineStyle: 0,
                                    lineWidth: 3,
                                    crosshairMarkerVisible: false,
                                    priceLineVisible: false,
                                },
                            },
                        ]}
                    />
                </div>
                <div className="d-flex flex-column mt-4 mt-lg-0 ">
                    <span className="small-text d-flex flex-row align-items-center">
                        <span className={`${previousDayPercentage >= 0 ? 'arrow-up' : 'arrow-down'}`} />
                        {numeral(previousDayPercentage).format('+0.00%')} ({t('common.day')})
                    </span>
                    <span className="big-text fs-4">{numeral(lumPrice).format('$0,0.0000')}</span>
                </div>
                <Button buttonType="custom" className="mt-4 mt-lg-0 align-self-start" onClick={onBuy}>
                    <Card withoutPadding className="p-3">
                        <b>{t('dashboard.getLum')}</b>
                    </Card>
                </Button>
            </div>
        </Card>
    );
};

export default LumPriceCard;
