import { useState } from "react";
import CreatePostCard from "@/components/posts/CreatePostCard";
import FollowingPostsList from "@/components/posts/FollowingPostsList";
import ForYouPostsList from "@/components/posts/ForYouPostsList";


const HomeFeed = () => {

    const [activeTab, setActiveTab] = useState<"forYou" | "following">("forYou");

    return (<>


        {/* Tab bar */}
        <div className="sticky top-0 z-30 border-b border-(--input-border) bg-(--bg-color)/70 backdrop-blur-md">

            <div className="flex h-14">

                <button
                    onClick={() => setActiveTab("forYou")}
                    className={`flex-1 text-center font-normal relative hover:bg-(--hover)/50 cursor-pointer ${activeTab === "forYou" ? "font-semibold" : ""}`}
                >
                    For you
                    {activeTab === "forYou" && (
                        <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-1 w-16 bg-(--button-bg) rounded-tl-xl rounded-tr-2xl" />
                    )}
                </button>

                <button
                    onClick={() => setActiveTab("following")}
                    className={`flex-1 text-center font-normal relative hover:bg-(--hover)/50 cursor-pointer ${activeTab === "following" ? "font-semibold" : ""}`}
                >
                    Following
                    {activeTab === "following" && (
                        <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-1 w-20 bg-(--button-bg) rounded-tl-xl rounded-tr-2xl" />
                    )}

                </button>

            </div>

        </div>


        {/* Create Post Card */}
        {activeTab === "forYou" && <CreatePostCard />}


        {activeTab === "forYou" && <ForYouPostsList tab={activeTab} />}
        {activeTab === "following" && <FollowingPostsList tab={activeTab} />}

    </>);
}

export default HomeFeed;