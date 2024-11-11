// config.js convertido a ESM

const credentials = {
    client_id: 'CLIENT_ID',
    client_secret: 'CLIENT_SECRET',
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

