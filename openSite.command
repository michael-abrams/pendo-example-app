kill $(lsof -t -i:99)
cd "${0%/*}"

if ! [ -x "$(command -v /opt/homebrew/bin/brew)" ]; then
    echo 'Installing brew ...' >&2
    /usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
fi
if ! [ -x "$(command -v npm)" ]; then
    echo 'Installing npm ...' >&2
    /usr/local/bin/brew install node
fi

export NPM_ROOT=`npm root -g`
export NPM_BIN=`echo $NPM_ROOT | sed 's/lib\/node_modules/bin/g'`

export NVM_DIR=$HOME/.nvm;
source $NVM_DIR/nvm.sh;
nvm install --lts
nvm use --lts

if ! [ -x "$(command -v browser-sync)" ]; then
    echo 'Installing browser-sync ...' >&2
    
    npm install -g browser-sync
fi

export LOCAL_IP=`ipconfig getifaddr en0`
browser-sync start -s -f . --no-notify --host $LOCAL_IP --port 99