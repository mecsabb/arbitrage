import requests
import pandas as pd


def get_conversion(curr1: str,curr2: str,fee = 0):
    """Returns the price of curr1 in terms of curr2 (i.e. price of 1 bitcoin in terms of USD), with a fee.
        The fee argument is a percentage (e.g 0.26 = 0.26%)
    """
    ticker_url = f"https://api.kraken.com/0/public/Ticker?pair={curr1}{curr2}"
    json = requests.get(ticker_url).json()
    try: 
        for pair, data in json['result'].items():
            price = float(data['c'][0])
            return price*(1+fee/100) #adding fee
    except Exception as e:
        print(f"An error occurred with curency {curr1}{curr2}: {str(e)}")
        return -1


def get_asset_pairs():
    """
    Returns a list of all possible currency conversions (believe only in one direction), 
    from the kraken api
    """ 

    url = "https://api.kraken.com/0/public/AssetPairs"
    json = requests.get(url).json()
    pairs = []
    for pair in json['result']:
        currencies = json['result'][pair]['wsname'].split('/')
        pairs.append(currencies)
    return pairs


def get_all_conversions():
    """
    goes through every possible conversion and gets the price data for that conversion,
    exports as list of dictionaries, which can be converted into a pandas df, saved to a csv,
    or used as an argument for creating a graph with that data.
    """

    pairs = get_asset_pairs()
    conversions = []
    for pair in pairs:
        price = get_conversion(pair[0],pair[1])
        conversions.append({"curr1":pair[0],"curr2":pair[1],"price":price})
    return conversions


def save_to_csv(name, conversions: list):

    df = pd.DataFrame.from_records(conversions)
    df.to_csv(name, index=False)


def create_from_csv(name):

    df = pd.read_csv(name)
    return df.to_dict('records')