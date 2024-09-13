// config.js convertido a ESM

const credentials = {
    client_id: 'pxK3vawavXwIA0r6cxA5mIlgXTco2kjIhgybbyAgmHkgWtzM',
    client_secret: 'rbnPs5vBrqVm80xiAVAo5qlr4uXnVY6SJaDoVeyJIlWdeBk9dsu8QuTqrBAEGqWE',
    callback_url: process.env.FORGE_CALLBACK_URL
};

const scopes = {
    internal: ['bucket:create', 'bucket:read', 'data:read', 'data:create', 'data:write'],
    public: ['viewables:read']
};

export default {
    credentials,
    scopes
};
//pxK3vawavXwIA0r6cxA5mIlgXTco2kjIhgybbyAgmHkgWtzM
//rbnPs5vBrqVm80xiAVAo5qlr4uXnVY6SJaDoVeyJIlWdeBk9dsu8QuTqrBAEGqWE


/*
 client_id: '49FkrIoZFbuRA64ORi63YpE6djBWJz8M',
    client_secret: 'kypZruU2hH3TKscA',
    callback_url: process.env.FORGE_CALLBACK_URL
*/