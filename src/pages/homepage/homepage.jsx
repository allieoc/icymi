import React, {useContext, useEffect, useState} from "react";

function Homepage({ apiKey, baseUrl }) {

    const [topStories, setTopStories] = useState([]);

    useEffect(()=>{
        const fetchTopStories = async () => {
            try{
                const topStoriesResponse = await axios.get(
                    `${baseUrl}/topstories/v2/home.json?api-key=${apiKey}`
                );
                console.log(topStoriesResponse)
               // setTopStories(topStoriesResponse.data.results)
            }
            catch(err){
                console.log(err)
            }
        }
        fetchTopStories();
    }, [])

    return (
        <div>
            {
                topStories.map()
            }
        </div>

    );


}

export default Homepage