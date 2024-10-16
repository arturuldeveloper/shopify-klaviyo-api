const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
var cors = require('cors')

const app = express();
const PORT = process.env.PORT || 3000;

const KLAVIYO_API_KEY = 'pk_abee3e745673a437b554e27a9d6f8c4f07';
const headers = 
{
  'Content-Type': 'application/json',
  'Authorization': `Klaviyo-API-Key ${KLAVIYO_API_KEY}`,
  'revision': '2024-07-15'
};

app.use(bodyParser.json());

app.use(cors())

app.post('/api/subscribe', async (req, res) => {
  const { email, listId } = req.body;
  const profileData = {
    data: {
      type: 'profile',
      attributes: {
        email: email
      }
    }
  };
  
  try {
    const response = await axios.post('https://a.klaviyo.com/api/profiles/', profileData, {
      headers: headers
    });

    if(response?.data?.data?.id)
    {
      const listdata = {
        data: [{
          type: 'profile',
            id: response?.data?.data?.id
        }]
      };
      try {
        const listResponse = await axios.post(`https://a.klaviyo.com/api/lists/${listId}/relationships/profiles/`, listdata, {
          headers: headers
        });
        res.sendStatus(200);
      } catch(error) {
        res.sendStatus(404);
      };
    }
  } catch (error) {
    if(error?.response?.status == 409){
      try {
        error?.response?.data?.errors[0]?.meta?.duplicate_profile_id
        const listdata2 = {
          data: [{
            type: 'profile',
              id: error?.response?.data?.errors[0]?.meta?.duplicate_profile_id
          }]
        };
        const listResponse = await axios.post(`https://a.klaviyo.com/api/lists/${listId}/relationships/profiles/`, listdata2, {
          headers: headers
        });
        res.sendStatus(200);
      } catch(error) {
        res.sendStatus(404);
      };
    }
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
