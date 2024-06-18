import React, { useContext } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { IS_LOCAL_ENV } from '../ambient-utils/constants';
import { CrocEnvContext } from '../contexts/CrocEnvContext';
import Home from '../pages/platformAmbient/Home/Home';
import Trade from '../pages/platformAmbient/Trade/Trade';
import ChatPanel from '../components/Chat/ChatPanel';
import InitPool from '../pages/platformAmbient/InitPool/InitPool';
import Portfolio from '../pages/platformAmbient/Portfolio/Portfolio';
import Explore from '../pages/platformAmbient/Explore/Explore';
import Swap from '../pages/platformAmbient/Swap/Swap';

import NotFound from '../pages/common/NotFound/NotFound';
import ExampleForm from '../pages/platformAmbient/InitPool/FormExample';
import Limit from '../pages/platformAmbient/Trade/Limit/Limit';
import Range from '../pages/platformAmbient/Trade/Range/Range';
import Reposition from '../pages/platformAmbient/Trade/Reposition/Reposition';
import TradeSwap from '../pages/platformAmbient/Trade/Swap/Swap';

const PlatformAmbientRoutes: React.FC = () => {
    const { defaultUrlParams } = useContext(CrocEnvContext);

    return (
        <Routes>
            <Route path='/' element={<Home />} />
            <Route path='/trade' element={<Trade />}>
                <Route
                    path=''
                    element={<Navigate to='/trade/market' replace />}
                />
                <Route
                    path='market'
                    element={<Navigate to={defaultUrlParams.market} replace />}
                />
                <Route
                    path='market/:params'
                    element={<TradeSwap isOnTradeRoute={true} />}
                />
                <Route
                    path='limit'
                    element={<Navigate to={defaultUrlParams.limit} replace />}
                />
                <Route path='limit/:params' element={<Limit />} />
                <Route
                    path='pool'
                    element={<Navigate to={defaultUrlParams.pool} replace />}
                />
                <Route path='pool/:params' element={<Range />} />
                <Route
                    path='reposition'
                    element={<Navigate to={defaultUrlParams.pool} replace />}
                />
                <Route path='reposition/:params' element={<Reposition />} />
                <Route
                    path='edit/'
                    element={<Navigate to='/trade/market' replace />}
                />
            </Route>
            <Route
                path='/chat'
                element={<ChatPanel isFullScreen={true} appPage={true} />}
            />
            <Route
                path='/chat/:params'
                element={<ChatPanel isFullScreen={true} appPage={true} />}
            />
            <Route path='/initpool/:params' element={<InitPool />} />
            <Route path='/account' element={<Portfolio />} />
            <Route
                path='/xp-leaderboard'
                element={<Portfolio isLevelsPage isRanksPage />}
            />
            <Route path='/account/xp' element={<Portfolio isLevelsPage />} />
            <Route path='/account/points' element={<Portfolio isPointsTab />} />
            <Route
                path='/account/:address/points'
                element={<Portfolio isPointsTab />}
            />
            <Route
                path='/:address/points'
                element={<Portfolio isPointsTab />}
            />
            <Route
                path='/account/:address/xp/history'
                element={<Portfolio isLevelsPage isViewMoreActive />}
            />
            <Route
                path='/account/xp/history'
                element={<Portfolio isLevelsPage isViewMoreActive />}
            />
            <Route path='/account/:address' element={<Portfolio />} />
            <Route
                path='/account/:address/xp'
                element={<Portfolio isLevelsPage />}
            />
            <Route
                path='/swap'
                element={<Navigate replace to={defaultUrlParams.swap} />}
            />
            <Route
                path='/explore'
                element={<Navigate to='/explore/pools' replace />}
            />
            <Route path='/explore/pools' element={<Explore view='pools' />} />
            <Route path='/explore/tokens' element={<Explore view='tokens' />} />
            <Route path='/swap/:params' element={<Swap />} />
            <Route
                path='/template/form'
                element={IS_LOCAL_ENV ? <ExampleForm /> : <NotFound />}
            />
            <Route path='/:address' element={<Portfolio />} />
            <Route path='/:address/xp' element={<Portfolio isLevelsPage />} />
            <Route
                path='/:address/xp/history'
                element={<Portfolio isLevelsPage isViewMoreActive />}
            />
        </Routes>
    );
};

export default PlatformAmbientRoutes;