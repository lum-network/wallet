import React from 'react';
import './VoteBar.scss';

interface IProps {
    results: {
        yes: number;
        no: number;
        noWithVeto: number;
        abstain: number;
    };
}

const VoteBar = ({ results }: IProps): JSX.Element => {
    const stylesYes = {
        width: `${results.yes}%`,
    };
    const styleNo = {
        width: `${results.no}%`,
    };
    const styleNoWithVeto = {
        width: `${results.noWithVeto}%`,
    };
    const styleAbstain = {
        width: `${results.abstain}%`,
    };

    return (
        <div className="vote-bar d-flex">
            <div style={stylesYes} className="green" />
            <div style={styleNo} className="red" />
            <div style={styleNoWithVeto} className="yellow" />
            <div style={styleAbstain} className="grey" />
        </div>
    );
};

export default VoteBar;
