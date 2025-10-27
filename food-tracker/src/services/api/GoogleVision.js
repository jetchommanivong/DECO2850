const API_URL = 'https://vision.googleapis.com/v1/images:annotate?key=AIzaSyDRi71NWCaQ6_JaNYiarIi4HXfTn0HOQcw'

export const getTextFromImage = async(image) => {
    const data = {
        requests: [
            {
                image: {
                    content: image,
                },
                features: [
                    {
                        type: 'TEXT_DETECTION',
                        maxResults: 1,
                    },
                ],
            },
        ],
    };

    const result = await fetch(API_URL, {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });
    const json = await result.json()
    return json
}