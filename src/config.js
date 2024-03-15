// EXTERNAL_IPv4 = external server IP  (v4) which 'll be used by app clients; => leave empty for a localhost test
// Ex.: let EXTERNAL_IPv4= 10.20.30.40;
let EXTERNAL_IPv4;

// Dynamic assignation, after checking the previous EXTERNAL_IPv4 variable
const API_BASE_URL = EXTERNAL_IPv4 ? `http://${EXTERNAL_IPv4}:3001` : 'http://localhost:3001';
export default API_BASE_URL;
