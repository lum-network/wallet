import React, { useState } from 'react';
import { Carousel } from 'react-responsive-carousel';

import 'react-responsive-carousel/lib/styles/carousel.min.css';

const LAST = 3;

interface Props {
    onCarouselEnd?: () => void;
}

const WelcomeCarousel = (props: Props): JSX.Element => {
    const [currentSlide, setCurrentSlide] = useState(0);

    const onSlideChange = (index: number) => {
        if (currentSlide !== index) {
            setCurrentSlide(index);
        }
    };

    return (
        <div>
            <Carousel
                renderArrowPrev={() => null}
                renderArrowNext={() => null}
                selectedItem={currentSlide}
                onChange={onSlideChange}
            >
                <div>Slide 1</div>
                <div>Slide 2</div>
                <div>Slide 3</div>
                <div>Slide 4</div>
            </Carousel>
            <div>
                {currentSlide > 0 && <button onClick={() => setCurrentSlide(currentSlide - 1)}>Back</button>}
                <button
                    onClick={() => {
                        const { onCarouselEnd } = props;
                        if (currentSlide === LAST && onCarouselEnd) {
                            onCarouselEnd();
                        }
                        setCurrentSlide(currentSlide + 1);
                    }}
                >
                    {currentSlide === LAST ? 'Start' : 'Next'}
                </button>
            </div>
        </div>
    );
};

export default WelcomeCarousel;
