import { XMarkIcon } from "@heroicons/react/20/solid";

const ReviewsPrerequisites = ({ setShowReviewsPrerequisitesPopup, setSelectedTab }) => {
  return (
    <div
      className="justify-center items-center flex overflow-x-hidden overflow-y-hidden fixed inset-0 z-50 outline-none focus:outline-none bg-[#12111157]"
      onClick={(e) => {
        e.stopPropagation();
        setShowReviewsPrerequisitesPopup(false);
      }}
    >
      <div
        className="relative my-6 ml-auto max-w-3xl w-[700px] h-screen"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-0 rounded-l-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none h-screen overflow-auto">
          <div className="flex items-start justify-between p-5 border-b border-solid border-blueGray-200 rounded-t">
            <h3 className="text-2xl font-semibold">Refresh Prerequisites</h3>
            <button
              className="p-1 ml-auto border-0 text-black float-right text-3xl leading-none font-semibold outline-none focus:outline-none"
              onClick={() => setShowReviewsPrerequisitesPopup(false)}
            >
              <XMarkIcon className="w-6 h-6 text-[#d6d6d6]" />
            </button>
          </div>
          <div className="px-4 py-8">
            <h2 className="text-2xl font-bold">Play Store Reviews</h2>
            <p className="my-4">
              - Allow reply to reviews access on google console by giving
              necessary permissions to our ID.
            </p>
            <ul className="list-decimal pl-6 mb-4">
              <li className="mb-2">
                Go to the Users & Permissions page on the Google Play Console.
              </li>
              <li className="mb-2">
                Click <b>Invite new users</b>.
              </li>
              <li className="mb-2">
                {`Put our email address in the email address field and grant the necessary rights to perform actions, in our Case -> Reply to Reviews`}
                .
              </li>
              <li className="mb-2">
                Email Address to be Added :
                review-api@gamepac.iam.gserviceaccount.com.
              </li>
              <li className="mb-2">{`Add the Package Names -> You want the reviews for.`}</li>
            </ul>

            <h2 className="text-2xl font-bold">Apple Store Reviews</h2>
            <p className="my-4">
              - To generate a team API key to use with the App Store Connect
              API.
            </p>
            <ul className="list-decimal pl-6">
              <li className="mb-2">log in to App Store Connect.</li>
              <li className="mb-2">
                Select Users and Access, and then select the API Keys tab.
              </li>
              <li className="mb-2">Make sure the Team Keys tab is selected.</li>
              <li className="mb-2">
                Click Generate API Key or the Add (+) button.
              </li>
              <li className="mb-2">
                Enter a name for the key. The name is for your reference only
                and isn’t part of the key itself.
              </li>
              <li>Under Access, select the role for the key.</li>
              <li>Click Generate.</li>
              <li>
                The new key’s name, key ID, a download link, and other
                information appears on the page.
              </li>
              <li onClick={() => setSelectedTab("apple-api-key")} className=" cursor-pointer">Share the Details of the App Store Key on GamePac <a className="underline decoration-2">Here</a></li>
              <li>Add App Id for which you want to get reviews.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewsPrerequisites;
