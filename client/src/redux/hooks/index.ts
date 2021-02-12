import { useDispatch } from 'react-redux';

export const useRematchDispatch = <D extends Record<string, unknown>, MD>(selector: (dispatch: D) => MD): MD => {
    const dispatch = useDispatch<D>();
    return selector(dispatch);
};
