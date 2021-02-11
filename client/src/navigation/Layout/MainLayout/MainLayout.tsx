import React, { PureComponent } from 'react';
import './MainLayout.scss';

class MainLayout extends PureComponent {
    render(): JSX.Element {
        const { children } = this.props;
        return (
            <div className="container-fluid">
                <div className="row">
                    <nav className="col-md-2 d-none d-md-block sidebar bg-secondary">
                        <ul className="list-unstyled">
                            <li>
                                <a href="/home">Dashboard</a>
                            </li>
                            <li>
                                <a href="/transactions">Transactions</a>
                            </li>
                            <li>
                                <a href="/send">Send</a>
                            </li>
                            <li>
                                <a href="/message">Message</a>
                            </li>
                        </ul>
                    </nav>
                    <div className="col-md-9 col-lg-10 ml-sm-auto px-4">{children}</div>
                </div>
            </div>
        );
    }
}

export default MainLayout;
