import { PricingCardProps } from "@/components/Cards/PricingCard"
import { ChatCompletionMessage } from "openai/resources/chat"

export const systemMessage: ChatCompletionMessage = {
    role: "system",
    content: `An AI assistant that helps generate summaries and show notes for podcasters. 
          AI assistant is a brand new, powerful, human-like artificial intelligence. 
          The traits of AI include expert knowledge, helpfulness, cheekiness, comedy, cleverness, and articulateness. 
          AI is a well-behaved and well-mannered individual. 
          AI is not a therapist, but instead a podcast expert. 
          AI is always friendly, kind, and inspiring, and he is eager to provide vivid and thoughtful responses to the user. 
          AI has the sum of all knowledge in their brain, and is able to accurately answer nearly any question about any topic in conversation. 
          AI assistant is a big fan of podcasts.
          AI assistant respects language of the content received from the user.`,
}

export const avatars = [
    "https://res.cloudinary.com/tonyjara/image/upload/v1691623638/podcast-solutions/avatars/hqa76voqxhz7iolzzeo9.jpg",
    "https://res.cloudinary.com/tonyjara/image/upload/v1691623637/podcast-solutions/avatars/birkhahcepzom9i4u8n1.jpg",
    "https://res.cloudinary.com/tonyjara/image/upload/v1691623637/podcast-solutions/avatars/uibbhsvlb8lrjjafeuwl.jpg",
    "https://res.cloudinary.com/tonyjara/image/upload/v1691623637/podcast-solutions/avatars/l9wa3gpbw93rbhnyekmy.jpg",
    "https://res.cloudinary.com/tonyjara/image/upload/v1691623637/podcast-solutions/avatars/q9rjtdocxlbbnfbe0ahc.jpg",
    "https://res.cloudinary.com/tonyjara/image/upload/v1691623637/podcast-solutions/avatars/lxrk5zc2lgbqccq3ahpc.jpg",
]
export const randomAvatar = () => {
    const randomIndex = Math.floor(Math.random() * avatars.length)
    return avatars[randomIndex] as string
}

export interface pricing {
    title: string
    monthlyPrice: number
    features: string[]
}

export const siteData = {}

export const podcastCategories = {
    Arts: [
        "Books",
        "Design",
        "Fashion & Beauty",
        "Food",
        "Performing Arts",
        "Visual Arts",
    ],
    Business: [
        "Careers",
        "Entrepreneurship",
        "Investing",
        "Management",
        "Marketing",
        "Non-Profit",
    ],
    Comedy: ["Comedy Interviews", "Improv", "Stand-Up"],
    Education: ["Courses", "How To", "Language Learning", "Self-Improvement"],
    Fiction: ["Comedy Fiction", "Drama", "Science Fiction"],
    Government: ["Government"],
    History: ["History"],
    "Health & Fitness": [
        "Alternative Health",
        "Fitness",
        "Medicine",
        "Mental Health",
        "Nutrition",
        "Sexuality",
    ],
    "Kids & Family": [
        "Education for Kids",
        "Parenting",
        "Pets & Animals",
        "Stories for Kids",
    ],
    Leisure: [
        "Animation & Manga",
        "Automotive",
        "Aviation",
        "Crafts",
        "Games",
        "Hobbies",
        "Home & Garden",
        "Video Games",
    ],
    Music: ["Music Commentary", "Music History", "Music Interviews"],
    News: [
        "Business News",
        "Daily News",
        "Entertainment News",
        "News Commentary",
        "Politics",
        "Sports News",
        "Tech News",
    ],
    "Religion & Spirituality": [
        "Buddhism",
        "Christianity",
        "Hinduism",
        "Islam",
        "Judaism",
        "Religion",
        "Spirituality",
    ],
    Science: [
        "Astronomy",
        "Chemistry",
        "Earth Sciences",
        "Life Sciences",
        "Mathematics",
        "Natural Sciences",
        "Nature",
        "Physics",
        "Social Sciences",
    ],
    "Society & Culture": [
        "Documentary",
        "Personal Journals",
        "Philosophy",
        "Places & Travel",
        "Relationships",
    ],
    Sports: [
        "Baseball",
        "Basketball",
        "Cricket",
        "Fantasy Sports",
        "Football",
        "Golf",
        "Hockey",
        "Rugby",
        "Running",
        "Soccer",
        "Swimming",
        "Tennis",
        "Volleyball",
        "Wilderness",
        "Wrestling",
    ],
    Technology: ["Technology"],
    "True Crime": ["True Crime"],
    "TV & Film": [
        "After Shows",
        "Film History",
        "Film Interviews",
        "Film Reviews",
        "TV Reviews",
    ],
}

export const languageOptions = [
    { value: "af", label: "Afrikaans" },
    { value: "ak", label: "Akan" },
    { value: "sq", label: "Albanian" },
    { value: "ar", label: "Arabic" },
    { value: "hy", label: "Armenian" },
    { value: "az", label: "Azerbaijani" },
    { value: "bm", label: "Bambara" },
    { value: "eu", label: "Basque" },
    { value: "be", label: "Belarusian" },
    { value: "bn", label: "Bengali" },
    { value: "bs", label: "Bosnian" },
    { value: "br", label: "Breton" },
    { value: "bg", label: "Bulgarian" },
    { value: "my", label: "Burmese" },
    { value: "ca", label: "Catalan" },
    { value: "km", label: "Central Khmer" },
    { value: "ce", label: "Chechen" },
    { value: "zh-cn", label: "Chinese (Simplified)" },
    { value: "zh-tw", label: "Chinese (Traditional)" },
    { value: "kw", label: "Cornish" },
    { value: "hr", label: "Croatian" },
    { value: "cs", label: "Czech" },
    { value: "da", label: "Danish" },
    { value: "nl", label: "Dutch" },
    { value: "nl-be", label: "Dutch (Belgium)" },
    { value: "nl-nl", label: "Dutch (Netherlands)" },
    { value: "dz", label: "Dzongkha" },
    { value: "en", label: "English" },
    { value: "en-au", label: "English (Australia)" },
    { value: "en-bz", label: "English (Belize)" },
    { value: "en-ca", label: "English (Canada)" },
    { value: "en-ie", label: "English (Ireland)" },
    { value: "en-jm", label: "English (Jamaica)" },
    { value: "en-nz", label: "English (New Zealand)" },
    { value: "en-ph", label: "English (Phillipines)" },
    { value: "en-za", label: "English (South Africa)" },
    { value: "en-tt", label: "English (Trinidad)" },
    { value: "en-gb", label: "English (United Kingdom)" },
    { value: "en-us", label: "English (United States)" },
    { value: "en-zw", label: "English (Zimbabwe)" },
    { value: "eo", label: "Esperanto" },
    { value: "et", label: "Estonian" },
    { value: "ee", label: "Ewe" },
    { value: "fo", label: "Faeroese" },
    { value: "fil", label: "Filipino" },
    { value: "fi", label: "Finnish" },
    { value: "fr", label: "French" },
    { value: "fr-be", label: "French (Belgium)" },
    { value: "fr-ca", label: "French (Canada)" },
    { value: "fr-fr", label: "French (France)" },
    { value: "fr-lu", label: "French (Luxembourg)" },
    { value: "fr-mc", label: "French (Monaco)" },
    { value: "fr-ch", label: "French (Switzerland)" },
    { value: "ff", label: "Fulah" },
    { value: "gd", label: "Gaelic" },
    { value: "gl", label: "Galician" },
    { value: "lg", label: "Ganda" },
    { value: "ka", label: "Georgian" },
    { value: "de", label: "German" },
    { value: "de-at", label: "German (Austria)" },
    { value: "de-de", label: "German (Germany)" },
    { value: "de-li", label: "German (Liechtenstein)" },
    { value: "de-lu", label: "German (Luxembourg)" },
    { value: "de-ch", label: "German (Switzerland)" },
    { value: "el", label: "Greek" },
    { value: "gu", label: "Gujarati" },
    { value: "ha", label: "Hausa" },
    { value: "haw", label: "Hawaiian" },
    { value: "he", label: "Hebrew" },
    { value: "hi", label: "Hindi" },
    { value: "hu", label: "Hungarian" },
    { value: "is", label: "Icelandic" },
    { value: "ig", label: "Igbo" },
    { value: "in", label: "Indonesian" },
    { value: "iu", label: "Inuktitut" },
    { value: "ga", label: "Irish" },
    { value: "it", label: "Italian" },
    { value: "it-it", label: "Italian (Italy)" },
    { value: "it-ch", label: "Italian (Switzerland)" },
    { value: "ja", label: "Japanese" },
    { value: "kl", label: "Kalaallisut" },
    { value: "kn", label: "Kannada" },
    { value: "ks", label: "Kashmiri" },
    { value: "kk", label: "Kazakh" },
    { value: "ki", label: "Kikuyu" },
    { value: "rw", label: "Kinyarwanda" },
    { value: "ky", label: "Kirghiz" },
    { value: "ko", label: "Korean" },
    { value: "lo", label: "Lao" },
    { value: "lv", label: "Latvian" },
    { value: "ln", label: "Lingala" },
    { value: "lt", label: "Lithuanian" },
    { value: "lu", label: "Luba-Katanga" },
    { value: "lb", label: "Luxembourgish" },
    { value: "mk", label: "Macedonian" },
    { value: "mg", label: "Malagasy" },
    { value: "ms", label: "Malay" },
    { value: "ml", label: "Malayalam" },
    { value: "mt", label: "Maltese" },
    { value: "gv", label: "Manx" },
    { value: "mr", label: "Marathi" },
    { value: "mn", label: "Mongolian" },
    { value: "nd", label: "Ndebele, North" },
    { value: "nr", label: "Ndebele, South" },
    { value: "ne", label: "Nepali" },
    { value: "se", label: "Northern Sami" },
    { value: "no", label: "Norwegian" },
    { value: "nb", label: "Norwegian Bokmål" },
    { value: "nn", label: "Norwegian Nynorsk" },
    { value: "om", label: "Oromo" },
    { value: "os", label: "Ossetian" },
    { value: "pa", label: "Panjabi" },
    { value: "fa", label: "Persian" },
    { value: "pl", label: "Polish" },
    { value: "pt", label: "Portuguese" },
    { value: "pt-br", label: "Portuguese (Brazil)" },
    { value: "pt-pt", label: "Portuguese (Portugal)" },
    { value: "qu", label: "Quechua" },
    { value: "ro", label: "Romanian" },
    { value: "ro-mo", label: "Romanian (Moldova)" },
    { value: "ro-ro", label: "Romanian (Romania)" },
    { value: "rm", label: "Romansh" },
    { value: "rn", label: "Rundi" },
    { value: "ru", label: "Russian" },
    { value: "ru-mo", label: "Russian (Moldova)" },
    { value: "ru-ru", label: "Russian (Russia)" },
    { value: "sg", label: "Sango" },
    { value: "sr", label: "Serbian" },
    { value: "sn", label: "Shona" },
    { value: "ii", label: "Sichuan Yi" },
    { value: "si", label: "Sinhala" },
    { value: "sk", label: "Slovak" },
    { value: "sl", label: "Slovenian" },
    { value: "so", label: "Somali" },
    { value: "es", label: "Spanish" },
    { value: "es-ar", label: "Spanish (Argentina)" },
    { value: "es-bo", label: "Spanish (Bolivia)" },
    { value: "es-cl", label: "Spanish (Chile)" },
    { value: "es-co", label: "Spanish (Colombia)" },
    { value: "es-cr", label: "Spanish (Costa Rica)" },
    { value: "es-do", label: "Spanish (Dominican Republic)" },
    { value: "es-ec", label: "Spanish (Ecuador)" },
    { value: "es-sv", label: "Spanish (El Salvador)" },
    { value: "es-gt", label: "Spanish (Guatemala)" },
    { value: "es-hn", label: "Spanish (Honduras)" },
    { value: "es-mx", label: "Spanish (Mexico)" },
    { value: "es-ni", label: "Spanish (Nicaragua)" },
    { value: "es-pa", label: "Spanish (Panama)" },
    { value: "es-py", label: "Spanish (Paraguay)" },
    { value: "es-pe", label: "Spanish (Peru)" },
    { value: "es-pr", label: "Spanish (Puerto Rico)" },
    { value: "es-es", label: "Spanish (Spain)" },
    { value: "es-uy", label: "Spanish (Uruguay)" },
    { value: "es-ve", label: "Spanish (Venezuela)" },
    { value: "sw", label: "Swahili" },
    { value: "sv", label: "Swedish" },
    { value: "sv-fi", label: "Swedish (Finland)" },
    { value: "sv-se", label: "Swedish (Sweden)" },
    { value: "tl", label: "Tagalog" },
    { value: "tg", label: "Tajik" },
    { value: "ta", label: "Tamil" },
    { value: "tt", label: "Tatar" },
    { value: "te", label: "Telugu" },
    { value: "th", label: "Thai" },
    { value: "bo", label: "Tibetan" },
    { value: "ti", label: "Tigrinya" },
    { value: "to", label: "Tonga (Tonga Islands)" },
    { value: "tr", label: "Turkish" },
    { value: "tk", label: "Turkmen" },
    { value: "ug", label: "Uighur" },
    { value: "uk", label: "Ukrainian" },
    { value: "ur", label: "Urdu" },
    { value: "uz", label: "Uzbek" },
    { value: "vi", label: "Vietnamese" },
    { value: "cy", label: "Welsh" },
    { value: "wo", label: "Wolof" },
    { value: "yi", label: "Yiddish" },
    { value: "yo", label: "Yoruba" },
    { value: "zu", label: "Zulu" },
]

export const freePricingCard: PricingCardProps = {
    title: "Free",
    defaultPriceId: "",
    prices: [],
    features:
        "1 Podcast, 1 User, 1 Gb of  storage, Rss Feed, 50.000 Chat GPT I/O tokens, 3 hours of audio transcription".split(
            ","
        ),
    payAsYouGo: [],
    description: "Try for a month, no credit card required.",
    handleCheckout: () => {},
    autenticated: false,
}

export const podcastBlogUrl = "https://blog.podcastsolutions.org"

// Socials

export const twitterUrl = "https://twitter.com/podcastsolu"
export const instagramUrl = "https://www.instagram.com/podcastsolu"
export const youtubeUrl =
    "https://www.youtube.com/channel/UCKrBkFNOgqJ9g58VjAyfPCw"
