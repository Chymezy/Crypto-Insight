import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchAssetDetails, fetchPriceHistory, fetchOHLCData } from '../services/api';
import { DetailedAsset } from '../types';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { FaHeart, FaRegHeart, FaExchangeAlt, FaChartBar, FaStickyNote, FaAddressBook, FaArrowUp, FaArrowDown, FaWallet, FaChevronDown, FaChartLine } from 'react-icons/fa';
import { format } from "d3-format";
import { timeFormat } from "d3-time-format";
import {
  ChartCanvas,
  CandlestickSeries,
  Chart,
  CrossHairCursor,
  MouseCoordinateX,
  MouseCoordinateY,
  XAxis as FinancialXAxis,
  YAxis as FinancialYAxis,
  OHLCTooltip,
} from "react-financial-charts";
import { scaleTime } from "d3-scale";
import { ScaleTime } from "d3-scale";

const AssetDetails: React.FC = () => {
  const { assetId } = useParams<{ assetId: string }>();
  const [asset, setAsset] = useState<DetailedAsset | null>(null);
  const [priceHistory, setPriceHistory] = useState<{ date: number; price: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [timeframe, setTimeframe] = useState<'24h' | '7d' | '30d' | '1y'>('7d');
  const [isFavorite, setIsFavorite] = useState(false);
  const [convertAmount, setConvertAmount] = useState<number>(1);
  const [note, setNote] = useState<string>('');
  const [isPremium, setIsPremium] = useState(false);
  const [chartType, setChartType] = useState<'area' | 'candlestick'>('area');
  const [ohlcData, setOhlcData] = useState<{ date: Date; open: number; high: number; low: number; close: number }[]>([]);

  useEffect(() => {
    const loadAssetDetails = async () => {
      try {
        setLoading(true);
        if (assetId) {
          console.log('Fetching details for asset:', assetId);
          const data = await fetchAssetDetails(assetId);
          setAsset(data);
          const history = await fetchPriceHistory(assetId, timeframe);
          setPriceHistory(history);
          
          try {
            const ohlcHistory = await fetchOHLCData(assetId, timeframe);
            setOhlcData(Array.isArray(ohlcHistory) && ohlcHistory.length > 0 ? ohlcHistory : []);
          } catch (ohlcError) {
            console.error('Error fetching OHLC data:', ohlcError);
            setOhlcData([]);
          }
        } else {
          throw new Error('Asset ID is undefined');
        }
        setError(null);
      } catch (error) {
        console.error('Error fetching asset details:', error);
        setError('Failed to load asset details');
        setAsset(null);
        setPriceHistory([]);
        setOhlcData([]);
      } finally {
        setLoading(false);
      }
    };
    loadAssetDetails();
  }, [assetId, timeframe]);

  if (loading) return <div className="text-center py-8 text-xl">Loading asset details...</div>;
  if (error) return <div className="text-center py-8 text-xl text-red-500">{error}</div>;
  if (!asset) return <div className="text-center py-8 text-xl">No asset data available.</div>;

  const formatDescription = (description: string) => {
    const lines = description.split('\n').filter(line => line.trim() !== '');
    const shortDescription = lines.slice(0, 2).join('\n');
    const fullDescription = lines.join('\n');
    return { shortDescription, fullDescription };
  };

  const { shortDescription, fullDescription } = formatDescription(asset.description || '');

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
    // TODO: Implement backend logic to save favorite status
  };

  const formatLargeNumber = (num: number) => {
    if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
    return num.toFixed(2);
  };

  const PriceChangeIndicator = ({ change }: { change: number }) => (
    <span className={`flex items-center ${change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
      {change >= 0 ? <FaArrowUp className="mr-1" /> : <FaArrowDown className="mr-1" />}
      {Math.abs(change).toFixed(2)}%
    </span>
  );

  interface CandlestickChartProps {
    data: { date: Date; open: number; high: number; low: number; close: number }[];
    width: number;
    height: number;
  }

  const CandlestickChart: React.FC<CandlestickChartProps> = ({ data, width, height }) => {
    // Check if data is empty or undefined
    if (!data || data.length === 0) {
      return (
        <div style={{ width, height }} className="flex items-center justify-center bg-gray-800 text-white">
          No data available for candlestick chart
        </div>
      );
    }

    const xAccessor = (d: { date: Date }) => d.date;
    const xExtents = [xAccessor(data[0]), xAccessor(data[data.length - 1])];

    return (
      <ChartCanvas
        height={height}
        width={width}
        ratio={1}
        margin={{ left: 50, right: 50, top: 10, bottom: 30 }}
        data={data}
        xAccessor={xAccessor}
        xScale={scaleTime() as ScaleTime<number, number>}
        xExtents={xExtents}
        seriesName="OHLC"
      >
        <Chart id={1} yExtents={(d) => [d.high, d.low]}>
          <FinancialXAxis axisAt="bottom" orient="bottom" ticks={6} />
          <FinancialYAxis axisAt="left" orient="left" ticks={5} />
          <CandlestickSeries />
          <MouseCoordinateX
            at="bottom"
            orient="bottom"
            displayFormat={timeFormat("%Y-%m-%d")}
          />
          <MouseCoordinateY
            at="left"
            orient="left"
            displayFormat={format(".2f")}
          />
          <OHLCTooltip origin={[-40, 0]} />
        </Chart>
        <CrossHairCursor />
      </ChartCanvas>
    );
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <img src={asset.image} alt={asset.name} className="w-20 h-20 mr-6" />
            <div>
              <h1 className="text-4xl font-bold mb-2">{asset.name}</h1>
              <p className="text-2xl text-gray-400">{asset.symbol.toUpperCase()}</p>
            </div>
          </div>
          <button onClick={toggleFavorite} className="text-3xl">
            {isFavorite ? <FaHeart className="text-red-500" /> : <FaRegHeart />}
          </button>
        </div>
        <div>
          <p className="text-5xl font-bold mb-2">${asset.currentPrice?.toLocaleString() ?? 'N/A'}</p>
          <p className={`text-2xl ${asset.priceChange24h && asset.priceChange24h >= 0 ? 'text-green-500' : 'text-red-500'} font-semibold`}>
            {asset.priceChange24h?.toFixed(2) ?? 'N/A'}% (24h)
          </p>
        </div>
      </div>

      <div className="mb-12">
        <h2 className="text-3xl font-bold mb-6">Market Statistics</h2>
        <div className="bg-gray-800 p-6 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-semibold mb-2">Market Cap</h3>
              <p className="text-2xl font-bold">${formatLargeNumber(asset.marketCap ?? 0)}</p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Fully Diluted Valuation</h3>
              <p className="text-2xl font-bold">${formatLargeNumber((asset.totalSupply ?? 0) * (asset.currentPrice ?? 0))}</p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Circulating Supply</h3>
              <p className="text-2xl font-bold">{formatLargeNumber(asset.circulatingSupply ?? 0)} {asset.symbol.toUpperCase()}</p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Total Supply</h3>
              <p className="text-2xl font-bold">{asset.totalSupply ? formatLargeNumber(asset.totalSupply) : 'N/A'} {asset.symbol.toUpperCase()}</p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Volume 24h</h3>
              <p className="text-2xl font-bold">${formatLargeNumber(asset.totalVolume ?? 0)}</p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Price Changes</h3>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-sm text-gray-400">1h</p>
                  <PriceChangeIndicator change={asset.priceChange1h ?? 0} />
                </div>
                <div>
                  <p className="text-sm text-gray-400">24h</p>
                  <PriceChangeIndicator change={asset.priceChange24h ?? 0} />
                </div>
                <div>
                  <p className="text-sm text-gray-400">7d</p>
                  <PriceChangeIndicator change={asset.priceChange7d ?? 0} />
                </div>
                <div>
                  <p className="text-sm text-gray-400">30d</p>
                  <PriceChangeIndicator change={asset.priceChange30d ?? 0} />
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">All Time High</h3>
              <p className="text-2xl font-bold">${asset.allTimeHigh?.price.toFixed(2) ?? 'N/A'}</p>
              <p className="text-sm text-gray-400">{asset.allTimeHigh?.date ? new Date(asset.allTimeHigh.date).toLocaleDateString() : 'N/A'}</p>
              <PriceChangeIndicator change={((asset.currentPrice ?? 0) - (asset.allTimeHigh?.price ?? 0)) / (asset.allTimeHigh?.price ?? 1) * 100} />
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">All Time Low</h3>
              <p className="text-2xl font-bold">${asset.allTimeLow?.price.toFixed(2) ?? 'N/A'}</p>
              <p className="text-sm text-gray-400">{asset.allTimeLow?.date ? new Date(asset.allTimeLow.date).toLocaleDateString() : 'N/A'}</p>
              <PriceChangeIndicator change={((asset.currentPrice ?? 0) - (asset.allTimeLow?.price ?? 0)) / (asset.allTimeLow?.price ?? 1) * 100} />
            </div>
          </div>
        </div>
      </div>

      <div className="mb-12">
        <h2 className="text-3xl font-bold mb-6">Price Chart</h2>
        <div className="mb-6 flex justify-between items-center">
          <div>
            {['24h', '7d', '30d', '1y'].map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf as '24h' | '7d' | '30d' | '1y')}
                className={`mr-4 px-6 py-2 rounded-full text-lg font-semibold ${timeframe === tf ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'}`}
              >
                {tf}
              </button>
            ))}
          </div>
          <div>
            <button
              onClick={() => setChartType('area')}
              className={`px-4 py-2 rounded-full text-lg font-semibold ${chartType === 'area' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'}`}
            >
              <FaChartLine className="inline-block mr-2" /> Line
            </button>
            <button
              onClick={() => setChartType('candlestick')}
              className={`ml-4 px-4 py-2 rounded-full text-lg font-semibold ${chartType === 'candlestick' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'}`}
            >
              <FaChartBar className="inline-block mr-2" /> Candlestick
            </button>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={400}>
          {chartType === 'area' ? (
            <AreaChart data={priceHistory}>
              <defs>
                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="date" 
                tickFormatter={(unixTime) => {
                  const date = new Date(unixTime);
                  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                }}
                stroke="#9CA3AF"
                tick={{fontSize: 14}}
              />
              <YAxis 
                stroke="#9CA3AF"
                tick={{fontSize: 14}}
                domain={['auto', 'auto']}
              />
              <Tooltip 
                formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Price']} 
                labelFormatter={(label) => new Date(label).toLocaleString()} 
                contentStyle={{ backgroundColor: '#1F2937', border: 'none', fontSize: '14px' }}
                itemStyle={{ color: '#E5E7EB' }}
              />
              <Area 
                type="monotone" 
                dataKey="price" 
                stroke="#3B82F6" 
                fillOpacity={1}
                fill="url(#colorPrice)"
              />
            </AreaChart>
          ) : (
            <CandlestickChart data={ohlcData} width={800} height={400} />
          )}
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
        <div className="col-span-2">
          <h2 className="text-3xl font-bold mb-4">Description</h2>
          <p className="text-lg text-gray-300 leading-relaxed">
            {showFullDescription ? fullDescription : shortDescription}
          </p>
          {fullDescription !== shortDescription && (
            <button
              onClick={() => setShowFullDescription(!showFullDescription)}
              className="text-blue-400 hover:underline mt-4 text-lg font-semibold"
            >
              {showFullDescription ? 'Show Less' : 'Show More'}
            </button>
          )}
        </div>

        <div>
          <h2 className="text-3xl font-bold mb-4">Links</h2>
          {asset.website && <a href={asset.website} target="_blank" rel="noopener noreferrer" className="block text-blue-400 hover:underline mb-3 text-lg">Website</a>}
          {asset.explorer && <a href={asset.explorer} target="_blank" rel="noopener noreferrer" className="block text-blue-400 hover:underline mb-3 text-lg">Explorer</a>}
          {asset.reddit && <a href={asset.reddit} target="_blank" rel="noopener noreferrer" className="block text-blue-400 hover:underline mb-3 text-lg">Reddit</a>}
          {asset.github && <a href={asset.github} target="_blank" rel="noopener noreferrer" className="block text-blue-400 hover:underline text-lg">GitHub</a>}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        <div className="lg:col-span-2 bg-gray-800 p-6 rounded-lg">
          <h2 className="text-2xl font-bold mb-4 flex items-center"><FaExchangeAlt className="mr-2" /> Swap</h2>
          {!isPremium && (
            <div className="mb-4">
              <p className="text-gray-300 mb-2">Unlock swap feature with Premium</p>
              <Link 
                to="/pricing" 
                className="bg-yellow-500 text-black px-4 py-2 rounded-full text-lg font-semibold inline-block"
              >
                Go Premium
              </Link>
            </div>
          )}
          <div className="mb-4">
            <button className="bg-blue-600 text-white px-4 py-2 rounded-full text-lg font-semibold flex items-center">
              <FaWallet className="mr-2" /> Connect Wallet
            </button>
          </div>
          <div className="mb-4">
            <p className="text-gray-400 mb-2">Pay</p>
            <div className="flex items-center bg-gray-700 rounded-lg p-2">
              <img src={asset.image} alt={asset.name} className="w-8 h-8 mr-2" />
              <span className="flex-grow">{asset.symbol.toUpperCase()}</span>
              <FaChevronDown />
            </div>
          </div>
          <div className="mb-4">
            <p className="text-gray-400 mb-2">Receive</p>
            <div className="flex items-center bg-gray-700 rounded-lg p-2">
              <span className="flex-grow">Select a coin</span>
              <FaChevronDown />
            </div>
          </div>
          <button 
            className={`text-white px-6 py-2 rounded-full text-lg font-semibold w-full ${
              isPremium ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-600 cursor-not-allowed'
            }`}
            disabled={!isPremium}
          >
            {isPremium ? 'Swap' : 'Upgrade to Premium to Swap'}
          </button>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg h-fit">
          <h2 className="text-2xl font-bold mb-4 flex items-center"><FaChartBar className="mr-2" /> Converter</h2>
          <div className="flex items-center mb-4">
            <input
              type="number"
              value={convertAmount}
              onChange={(e) => setConvertAmount(Number(e.target.value))}
              className="bg-gray-700 text-white px-4 py-2 rounded-l-lg w-full"
            />
            <span className="bg-gray-600 text-white px-4 py-2 rounded-r-lg">{asset.symbol}</span>
          </div>
          <p className="text-xl text-gray-300">
            = ${((convertAmount * (asset.currentPrice ?? 0)).toLocaleString())} USD
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-2xl font-bold mb-4 flex items-center"><FaStickyNote className="mr-2" /> Notes</h2>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add your notes here..."
            className="bg-gray-700 text-white px-4 py-2 rounded-lg w-full h-32 resize-none"
          />
        </div>

        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-2xl font-bold mb-4 flex items-center"><FaChartBar className="mr-2" /> Reports</h2>
          <p className="text-gray-300 mb-4">Generate custom reports for {asset.name}</p>
          <button className="bg-blue-600 text-white px-6 py-2 rounded-full text-lg font-semibold">
            Generate Report
          </button>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-2xl font-bold mb-4 flex items-center"><FaAddressBook className="mr-2" /> Contacts</h2>
          <p className="text-gray-300 mb-4">Manage your {asset.name} contacts</p>
          <button className="bg-blue-600 text-white px-6 py-2 rounded-full text-lg font-semibold">
            View Contacts
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssetDetails;
