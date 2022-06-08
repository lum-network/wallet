import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import numeral from 'numeral';
import Chart from 'kaktana-react-lightweight-charts';
import { UTCTimestamp } from 'lightweight-charts';
import { Card } from 'frontend-elements';

import { BUY_LUM_URL } from 'constant';
import { NumbersUtils, WalletClient } from 'utils';

import './Cards.scss';

const LumPriceCard = (): JSX.Element => {
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
            if (chart && chart.length && chart.length - 24 >= 0 && chart[chart.length - 24]) {
                setPreviousDayPercentage(
                    NumbersUtils.getDifferencePercentage(chart[chart.length - 24].value, data.price),
                );
            }
        }
    }, []);

    return (
        <Card withoutPadding className="h-100 dashboard-card lum-price-card justify-content-start p-4">
            <h2 className="ps-2 pt-3">{t('dashboard.lumPrice')}</h2>
            <div className="ps-2 my-3 d-flex flex-column flex-lg-row justify-content-between align-items-lg-center w-100">
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
                <a
                    href={BUY_LUM_URL}
                    target="_blank"
                    rel="noreferrer"
                    className="scale-anim mt-4 mt-lg-0 align-self-start"
                >
                    <Card withoutPadding className="buy-btn px-4 py-3">
                        <b>{t('dashboard.getLum')}</b>
                    </Card>
                </a>
            </div>
        </Card>
    );
};

export default LumPriceCard;
