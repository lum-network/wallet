import { Card, Input } from 'components';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Carousel } from 'react-responsive-carousel';
import { useRematchDispatch } from 'redux/hooks';

import 'react-responsive-carousel/lib/styles/carousel.min.css';
import { RootDispatch, RootState } from 'redux/store';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';

const LAST = 3;

const CreateWallet = (): JSX.Element => {
    // State values
    const [currentSlide, setCurrentSlide] = useState(0);
    const [addressInput, setAddressInput] = useState('');
    const [introDone, setIntroDone] = useState(false);

    // Redux hooks
    const address = useSelector((state: RootState) => state.wallet.address);
    const { signIn } = useRematchDispatch((dispatch: RootDispatch) => ({
        signIn: dispatch.wallet.signInAsync,
    }));

    // Other hooks
    const history = useHistory();
    const { register, handleSubmit } = useForm();

    useEffect(() => {
        if (address) {
            history.push('/home');
        }
    }, [address]);

    const onSlideChange = (index: number) => {
        if (currentSlide !== index) {
            setCurrentSlide(index);
        }
    };

    const onSubmit = (data: { address: string }) => {
        signIn(data.address);
    };

    return (
        <div className="h-100 row align-items-center">
            {introDone ? (
                <div className="col">
                    <Card>
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <Input
                                ref={register}
                                value={addressInput}
                                name="address"
                                onChange={(event) => setAddressInput(event.target.value)}
                                required
                            />
                            <button type="submit">Create</button>
                        </form>
                    </Card>
                </div>
            ) : (
                <div className="col">
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
                                if (currentSlide === LAST) {
                                    setIntroDone(true);
                                }
                                setCurrentSlide(currentSlide + 1);
                            }}
                        >
                            {currentSlide === LAST ? 'Start' : 'Next'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CreateWallet;
