// Predefined Signature Flower Themes (11 Themes)
window.weddingThemes = {
    daisy: {
        id: "daisy",
        name: "Meadow Daisy",
        icon: "🌼",
        heroBouquetUrl: "assets/daisy_bouquet.jpg",
        heroBgUrl: "assets/hero_bg.jpg",
        colors: {
            creamBg: "#FCFAF7",
            sageLight: "#E9EFE9",
            sageMedium: "#BDCDBD",
            forest: "#2C3E2F",
            gold: "#D6A354"
        },
        petalType: "daisy",
        petalColors: ['rgba(250, 248, 245, 0.9)', 'rgba(240, 235, 225, 0.85)'],
        centerColor: 'rgba(227, 168, 87, 0.8)',
        dressCode: [
            { name: "Sage", hex: "#BDCDBD" },
            { name: "Rose Gold", hex: "#E2C0B6" },
            { name: "Warm Gold", hex: "#D6A354" },
            { name: "Champagne", hex: "#F5EDE0" },
            { name: "Forest", hex: "#2C3E2F" }
        ]
    },
    rose: {
        id: "rose",
        name: "Romantic Rose",
        icon: "🌹",
        heroBouquetUrl: "assets/theme_rose.jpg",
        heroBgUrl: "assets/hero_bg_rose.jpg",
        colors: {
            creamBg: "#FAF4F5",
            sageLight: "#F5E6E8",
            sageMedium: "#E2A9AC",
            forest: "#5C1D24",
            gold: "#D48B8F"
        },
        petalType: "rose",
        petalColors: ['rgba(220, 70, 85, 0.85)', 'rgba(240, 140, 150, 0.85)', 'rgba(180, 40, 60, 0.8)'],
        dressCode: [
            { name: "Crimson", hex: "#8B0000" },
            { name: "Dusty Rose", hex: "#DCAEAE" },
            { name: "Rose Gold", hex: "#B76E79" },
            { name: "Blush", hex: "#FFD1DC" },
            { name: "Burgundy", hex: "#4A0E17" }
        ]
    },
    sunflower: {
        id: "sunflower",
        name: "Golden Sunflower",
        icon: "🌻",
        heroBouquetUrl: "assets/theme_sunflower.jpg",
        heroBgUrl: "assets/hero_bg_sunflower.jpg",
        colors: {
            creamBg: "#FCF9F2",
            sageLight: "#FDF3D8",
            sageMedium: "#E6B800",
            forest: "#5C2B14",
            gold: "#D99B00"
        },
        petalType: "sunflower",
        petalColors: ['rgba(255, 195, 0, 0.9)', 'rgba(245, 166, 35, 0.85)', 'rgba(255, 215, 0, 0.9)'],
        centerColor: 'rgba(92, 43, 20, 0.85)',
        dressCode: [
            { name: "Sunflower Yellow", hex: "#FFC300" },
            { name: "Terracotta", hex: "#C85A32" },
            { name: "Mustard", hex: "#E1AD01" },
            { name: "Warm Gold", hex: "#D99B00" },
            { name: "Rustic Brown", hex: "#5C2B14" }
        ]
    },
    lavender: {
        id: "lavender",
        name: "French Lavender",
        icon: "🪻",
        heroBouquetUrl: "assets/theme_lavender.jpg",
        heroBgUrl: "assets/hero_bg_lavender.jpg",
        colors: {
            creamBg: "#F8F6FA",
            sageLight: "#E8E2F2",
            sageMedium: "#B6A6D6",
            forest: "#352C42",
            gold: "#9B82C3"
        },
        petalType: "lavender",
        petalColors: ['rgba(182, 166, 214, 0.85)', 'rgba(155, 130, 195, 0.85)', 'rgba(215, 200, 235, 0.9)'],
        dressCode: [
            { name: "Soft Lavender", hex: "#E8E2F2" },
            { name: "French Purple", hex: "#9B82C3" },
            { name: "Slate Violet", hex: "#5A4B6E" },
            { name: "Dusty Plum", hex: "#4A3B59" },
            { name: "Silver Sage", hex: "#C5C8C6" }
        ]
    },
    cherry_blossom: {
        id: "cherry_blossom",
        name: "Sakura Blossom",
        icon: "🌸",
        heroBouquetUrl: "assets/theme_cherry_blossom.jpg",
        heroBgUrl: "assets/hero_bg_cherry_blossom.svg",
        colors: {
            creamBg: "#FAF5F8",
            sageLight: "#FCE8F0",
            sageMedium: "#F4C2D7",
            forest: "#4A2535",
            gold: "#E085A8"
        },
        petalType: "sakura",
        petalColors: ['rgba(255, 192, 203, 0.9)', 'rgba(255, 182, 193, 0.85)', 'rgba(255, 228, 225, 0.9)'],
        dressCode: [
            { name: "Sakura Pink", hex: "#FFB7C5" },
            { name: "Soft Rose", hex: "#F4C2D7" },
            { name: "Pearl White", hex: "#F8F0F5" },
            { name: "Blossom Pink", hex: "#E085A8" },
            { name: "Deep Plum", hex: "#4A2535" }
        ]
    },
    tulip: {
        id: "tulip",
        name: "Dutch Tulip",
        icon: "🌷",
        heroBouquetUrl: "assets/theme_tulip.jpg",
        heroBgUrl: "assets/hero_bg_tulip.svg",
        colors: {
            creamBg: "#FAF6F2",
            sageLight: "#FBEAD6",
            sageMedium: "#E87059",
            forest: "#1B4434",
            gold: "#E09B43"
        },
        petalType: "tulip",
        petalColors: ['rgba(232, 112, 89, 0.85)', 'rgba(242, 160, 120, 0.85)', 'rgba(255, 180, 100, 0.85)'],
        dressCode: [
            { name: "Coral Tulip", hex: "#E87059" },
            { name: "Peach Blossom", hex: "#FBEAD6" },
            { name: "Garden Emerald", hex: "#1B4434" },
            { name: "Sunset Gold", hex: "#E09B43" },
            { name: "Cream White", hex: "#FAF6F2" }
        ]
    },
    orchid: {
        id: "orchid",
        name: "Royal Orchid",
        icon: "🌺",
        heroBouquetUrl: "assets/theme_orchid.jpg",
        heroBgUrl: "assets/hero_bg_orchid.svg",
        colors: {
            creamBg: "#F9F5FA",
            sageLight: "#F2E4F5",
            sageMedium: "#BA7AC6",
            forest: "#33153B",
            gold: "#D4AF37"
        },
        petalType: "orchid",
        petalColors: ['rgba(186, 122, 198, 0.85)', 'rgba(150, 80, 165, 0.85)', 'rgba(215, 165, 225, 0.9)'],
        dressCode: [
            { name: "Royal Orchid", hex: "#BA7AC6" },
            { name: "Imperial Purple", hex: "#6B2D82" },
            { name: "Luxury Gold", hex: "#D4AF37" },
            { name: "Midnight Violet", hex: "#33153B" },
            { name: "Soft Mauve", hex: "#E5D0EC" }
        ]
    },
    lotus: {
        id: "lotus",
        name: "Serene Lotus",
        icon: "🪷",
        heroBouquetUrl: "assets/theme_lotus.jpg",
        heroBgUrl: "assets/hero_bg_lotus.svg",
        colors: {
            creamBg: "#F4F8F7",
            sageLight: "#E0F0EC",
            sageMedium: "#EEB4C8",
            forest: "#1D4A47",
            gold: "#D5C089"
        },
        petalType: "lotus",
        petalColors: ['rgba(238, 180, 200, 0.85)', 'rgba(248, 210, 225, 0.9)', 'rgba(225, 240, 236, 0.85)'],
        dressCode: [
            { name: "Lotus Pink", hex: "#EEB4C8" },
            { name: "Watermist Teal", hex: "#88BDB6" },
            { name: "Serene Jade", hex: "#1D4A47" },
            { name: "Pale Gold", hex: "#D5C089" },
            { name: "Pure Pearl", hex: "#F4F8F7" }
        ]
    },
    peony: {
        id: "peony",
        name: "Blushing Peony",
        icon: "🏵️",
        heroBouquetUrl: "assets/theme_peony.jpg",
        heroBgUrl: "assets/hero_bg_peony.svg",
        colors: {
            creamBg: "#FAF4F6",
            sageLight: "#F9E2EB",
            sageMedium: "#DC96AE",
            forest: "#203B2B",
            gold: "#CF9B62"
        },
        petalType: "peony",
        petalColors: ['rgba(220, 150, 174, 0.85)', 'rgba(240, 185, 205, 0.9)', 'rgba(200, 120, 145, 0.8)'],
        dressCode: [
            { name: "Peony Pink", hex: "#DC96AE" },
            { name: "Blush Rose", hex: "#F9E2EB" },
            { name: "Botanical Emerald", hex: "#203B2B" },
            { name: "Vintage Gold", hex: "#CF9B62" },
            { name: "Soft Ivory", hex: "#FAF4F6" }
        ]
    },
    hydrangea: {
        id: "hydrangea",
        name: "Coastal Hydrangea",
        icon: "🫐",
        heroBouquetUrl: "assets/theme_hydrangea.jpg",
        heroBgUrl: "assets/hero_bg_hydrangea.svg",
        colors: {
            creamBg: "#F4F7FB",
            sageLight: "#E1E9F5",
            sageMedium: "#8AAAE5",
            forest: "#1C2D42",
            gold: "#E3D5C3"
        },
        petalType: "hydrangea",
        petalColors: ['rgba(138, 170, 229, 0.85)', 'rgba(165, 192, 240, 0.9)', 'rgba(110, 145, 210, 0.8)'],
        dressCode: [
            { name: "Hydrangea Blue", hex: "#8AAAE5" },
            { name: "Periwinkle", hex: "#A5C0F0" },
            { name: "Coastal Navy", hex: "#1C2D42" },
            { name: "Champagne", hex: "#E3D5C3" },
            { name: "Sea Mist", hex: "#E1E9F5" }
        ]
    },
    wildflower: {
        id: "wildflower",
        name: "Meadow Wildflower",
        icon: "💐",
        heroBouquetUrl: "assets/theme_wildflower.jpg",
        heroBgUrl: "assets/hero_bg_wildflower.svg",
        colors: {
            creamBg: "#FAF8F3",
            sageLight: "#F7EFC5",
            sageMedium: "#A3B18A",
            forest: "#3A402D",
            gold: "#C67D33"
        },
        petalType: "wildflower",
        petalColors: ['rgba(230, 120, 80, 0.85)', 'rgba(163, 177, 138, 0.85)', 'rgba(215, 170, 70, 0.85)', 'rgba(150, 110, 170, 0.85)'],
        dressCode: [
            { name: "Wild Ochre", hex: "#C67D33" },
            { name: "Meadow Sage", hex: "#A3B18A" },
            { name: "Buttercup", hex: "#F7EFC5" },
            { name: "Forest Olive", hex: "#3A402D" },
            { name: "Rust Coral", hex: "#E67850" }
        ]
    }
};

window.weddingConfig = {
    "theme": "lavender",
    "brideName": "Daisy",
    "groomName": "Alexander",
    "hashtag": "#DaisyAndAlexander2026",
    "weddingDateISO": "2026-10-17T16:00:00",
    "weddingDateFormatted": "10.17.2026 • SATURDAY",
    "rsvpDeadline": "September 1, 2026",
    "sections": {
        "parents": true,
        "quote": true,
        "story": true,
        "schedule": true,
        "dressCode": true,
        "accommodations": true,
        "countdown": true,
        "rsvp": true
    },
    "parents": {
        "subtitle": "WITH THE BLESSINGS OF OUR FAMILIES",
        "title": "Parents of the Bride & Groom",
        "brideParentsLabel": "Parents of the Bride",
        "brideParentsNames": "Mr. Arthur Alexander & Mrs. Evelyn Alexander",
        "groomParentsLabel": "Parents of the Groom",
        "groomParentsNames": "Mr. William Daisy & Mrs. Eleanor Daisy"
    },
    "loveQuote": {
        "text": "In all the world, there is no heart for me like yours. In all the world, there is no love for you like mine.",
        "author": "Maya Angelou"
    },
    "venue": {
        "name": "The Glasshouse at Daisy Farms",
        "address": "1288 Floral Valley Road, Meadowbrook",
        "note": "Valet parking is available at the entrance. The venue is fully accessible.",
        "mapsUrl": "https://maps.google.com"
    },
    "dressCode": {
        "style": "Garden Semi-Formal",
        "description": "We invite you to dress in warm garden colors to celebrate in harmony with our venue.",
        "colors": [
            {
                "name": "Soft Lavender",
                "hex": "#E8E2F2"
            },
            {
                "name": "French Purple",
                "hex": "#9B82C3"
            },
            {
                "name": "Slate Violet",
                "hex": "#5A4B6E"
            },
            {
                "name": "Dusty Plum",
                "hex": "#4A3B59"
            },
            {
                "name": "Silver Sage",
                "hex": "#C5C8C6"
            }
        ]
    },
    "accommodations": [
        {
            "name": "The Meadowbrook Inn",
            "phone": "+1 (555) 123-4567",
            "distance": "5 minutes from venue (Shuttle provided)",
            "link": "#"
        },
        {
            "name": "Floral Valley Boutique Manor",
            "phone": "+1 (555) 765-4321",
            "distance": "12 minutes from venue",
            "link": "#"
        }
    ],
    "musicUrl": "assets/beautiful_in_white.mp3",
    "petalDensity": 35,
    "colors": {
        "creamBg": "#F8F6FA",
        "sageLight": "#E8E2F2",
        "sageMedium": "#B6A6D6",
        "forest": "#352C42",
        "gold": "#9B82C3"
    },
    "design": {
        "heroBouquetUrl": "assets/theme_lavender.jpg",
        "heroBgUrl": "assets/hero_bg_lavender.jpg",
        "heroBouquetStyle": {
            "scale": 1,
            "x": 0,
            "y": 0,
            "rotate": 0
        },
        "dividerStyle": {
            "scale": 1,
            "rotate": 0
        },
        "overrides": {},
        "textOverrides": {},
        "floatingImages": []
    },
    "story": [
        {
            "date": "Spring 2021",
            "title": "Where it all began",
            "text": "We met by chance under the cherry blossom trees at the park. A dropped coffee cup led to a two-hour conversation, and we both knew this was something special."
        },
        {
            "date": "Summer 2023",
            "title": "The First Adventure",
            "text": "A spontaneous road trip along the coast. We spent weeks driving, listening to old cassette tapes, and hiking through redwood forests. It was then we knew we wanted to explore the world together forever."
        },
        {
            "date": "Autumn 2025",
            "title": "The Proposal",
            "text": "Under a starry night sky in a field full of wild daisies, Alexander asked the question. With tears, laughter, and an absolute \"Yes!\", the next chapter of our journey officially began."
        }
    ],
    "schedule": [
        {
            "icon": "💍",
            "title": "The Ceremony",
            "time": "4:00 PM - 5:00 PM",
            "details": "An outdoor ceremony in the Daisy Meadow, surrounded by towering oak trees and summer blooms."
        },
        {
            "icon": "🍸",
            "title": "Cocktail Hour",
            "time": "5:00 PM - 6:00 PM",
            "details": "Join us for refreshing signature drinks, light lawn games, and acoustic live music on the pavilion terrace."
        },
        {
            "icon": "🍽️",
            "title": "The Reception",
            "time": "6:00 PM - 8:30 PM",
            "details": "A banquet dinner under the glass atrium, followed by champagne toasts and heartfelt speeches."
        },
        {
            "icon": "✨",
            "title": "The Afterparty",
            "time": "8:30 PM - Late",
            "details": "Put on your dancing shoes! We will dance the night away under the stars with a live band and late-night snacks."
        }
    ]
};
