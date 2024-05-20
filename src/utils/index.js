export const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export function parseJwt(token) {
  if (token) {
    var base64Url = token.split(".")[1];
    var base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    var jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split("")
        .map(function (c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );

    return JSON.parse(jsonPayload);
  }
}

export const getAuthToken = () => {
  const userTokenData = localStorage.getItem("jwt");
  return JSON.parse(userTokenData);
};

export function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}
export const steps = [
  {
    content: 'Overview of the Studio, where you can find total number of users, games and reviews',
    placement: 'right',
    target: '.tab-0',
    disableBeacon: true
  },
  {
    content: 'you can add users of your studio here',
    placement: 'right',
    target: '.tab-1',
  },
  {
    content: 'Add games to see their reviews and analytics in Socials',
    placement: 'right',
    target: '.tab-2',
  },
  {
    content: 'you can edit your studio details',
    placement: 'right',
    target: '.tab-3',
  },
];
export const jetapultSteps = [
  {
    content: 'Overview of the Studio, where you can find total number of users, games and reviews',
    placement: 'right',
    target: '.tab-0',
    disableBeacon: true
  },
  {
    content: 'you can add users of your studio here',
    placement: 'right',
    target: '.tab-1',
  },
  {
    content: 'you can edit your studio details',
    placement: 'right',
    target: '.tab-3',
  },
  {
    content: 'You can upload your audio to get the Transcribed Data of your audio',
    placement: 'left',
    target: '.notetaker',
  },
  {
    content: 'Here you can access all the ai tools',
    placement: 'left',
    target: '.ai-tools',
  },
]
export const StudioSteps = [
  ...steps,
  {
    content: 'Generate API keys from App store connect to fetch the reviews from app store',
    placement: 'left',
    target: '.tab-4',
  },
  {
    content: 'Once you added your Games, All the Reviews will come under reply assisstant',
    placement: 'left',
    target: '.socials',
  },
  {
    content: 'You can upload your audio to get the Transcribed Data of your audio',
    placement: 'left',
    target: '.notetaker',
  },
  {
    content: 'Here you can access all the ai tools',
    placement: 'left',
    target: '.ai-tools',
  },
]
export const externalSteps = [
  ...steps,
  {
    content: 'Generate API keys from App store connect to fetch the reviews from app store',
    placement: 'left',
    target: '.tab-4',
  },
  {
    content: 'Once you added your Games, All the Reviews will come under reply assisstant',
    placement: 'left',
    target: '.socials',
  },
]
