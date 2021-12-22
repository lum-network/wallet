import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from 'redux/store';

const Governance = (): JSX.Element => {
    const { proposals } = useSelector((state: RootState) => ({
        proposals: state.governance.proposals,
    }));

    return (
        <div className="mt-4">
            <div className="container"></div>
        </div>
    );
};

export default Governance;
