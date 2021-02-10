import React, { PureComponent } from 'react';
import './MainLayout.scss';

class MainLayout extends PureComponent {
    render(): JSX.Element {
        const { children } = this.props;
        return (
            <div className="container-fluid">
                <div className="row">
                    <nav className="col-md-2 sidebar bg-secondary">
                        <ul className="list-unstyled">
                            <li>
                                <a href="home">Dashboard</a>
                            </li>
                            <li>
                                <a href="send">Send</a>
                            </li>
                            <li>
                                <a href="exchange">Exchange</a>
                            </li>
                            <li>
                                <a href="buy">Buy</a>
                            </li>
                        </ul>
                    </nav>
                    <div className="col-md-10">{children}</div>
                </div>
            </div>
        );
    }
}

export default MainLayout;
