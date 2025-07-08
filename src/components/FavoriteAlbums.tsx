import React from 'react'
import './FavoriteAlbums.css'

interface Album {
  id: number
  rank: number
  title: string
  artist: string
  year: number
  genre: string
  displayGenre: string
  categories: string[]
  coverImage: string
  description?: string
  favoriteTracks?: string[]
  spotifyAlbumId?: string
  youtubePlaylistId?: string
  youtubeMusicId?: string
}

// Complete album data with all 100 albums - genres, categories, Spotify IDs, and YouTube playlist IDs
const favoriteAlbums: Album[] = [
  {
    "id": 1,
    "rank": 1,
    "title": "Ys",
    "artist": "Joanna Newsom",
    "year": 2006,
    "genre": "Folk, Singer-Songwriter",
    "coverImage": "/images/albums/ys_joanna_newsom.jpg",
    "description": "2694",
    "youtubePlaylistId": "OLAK5uy_maIU33zxlEbqWl3Eu5yyA0cNK2juc3N8k",
    "displayGenre": "Folk, Singer-Songwriter",
    "categories": [
      "Folk"
    ],
    "spotifyAlbumId": ""
  },
  {
    "id": 2,
    "rank": 2,
    "title": "Bringing It All Back Home",
    "artist": "Bob Dylan",
    "year": 1965,
    "genre": "Folk Rock, Folk",
    "coverImage": "/images/albums/bringing_it_all_back_home_bob_dylan.jpg",
    "description": "46",
    "youtubePlaylistId": "OLAK5uy_kE7qNEra9ki9Y5ujekyHQWWpEfp8n8d4w",
    "displayGenre": "Folk Rock, Folk",
    "categories": [
      "Rock",
      "Folk"
    ],
    "spotifyAlbumId": "6dVIqQ8qmQ5GBnJ9shOYGE"
  },
  {
    "id": 3,
    "rank": 3,
    "title": "Dummy",
    "artist": "Portishead",
    "year": 1994,
    "genre": "Trip-Hop, Chillout, Electronic",
    "coverImage": "/images/albums/dummy_portishead.jpg",
    "description": "209",
    "youtubePlaylistId": "OLAK5uy_nMft1HP8iD7Wu0f0PfOKfao7r_nrBz6O8",
    "displayGenre": "Trip-Hop, Chillout, Electronic",
    "categories": [
      "Electronic"
    ],
    "spotifyAlbumId": "3539EbNgIdEDGBKkUf4wno"
  },
  {
    "id": 4,
    "rank": 4,
    "title": "The Freewheelin' Bob Dylan",
    "artist": "Bob Dylan",
    "year": 1963,
    "genre": "Folk",
    "coverImage": "/images/albums/the_freewheelin__bob_dylan_bob_dylan.jpg",
    "description": "48",
    "youtubePlaylistId": "OLAK5uy_nbrxY1_go_X2IYU44cQQVKPIyhAj7oDI0",
    "displayGenre": "Folk",
    "categories": [
      "Folk"
    ],
    "spotifyAlbumId": "0o1uFxZ1VTviqvNaYkTJek"
  },
  {
    "id": 5,
    "rank": 5,
    "title": "Blood On The Tracks",
    "artist": "Bob Dylan",
    "year": 1975,
    "genre": "Folk, Singer-Songwriter, Folk Rock",
    "coverImage": "/images/albums/blood_on_the_tracks_bob_dylan.jpg",
    "description": "45",
    "youtubePlaylistId": "OLAK5uy_lvz0faaZfaiCiyx9wWnvEl84d__8vIUT8",
    "displayGenre": "Folk, Singer-Songwriter, Folk Rock",
    "categories": [
      "Folk",
      "Rock"
    ],
    "spotifyAlbumId": "4WD4pslu83FF6oMa1e19mF"
  },
  {
    "id": 6,
    "rank": 6,
    "title": "Blue",
    "artist": "Joni Mitchell",
    "year": 1971,
    "genre": "Folk, Singer-Songwriter, Female Vocalists",
    "coverImage": "/images/albums/blue_joni_mitchell.jpg",
    "description": "132",
    "youtubePlaylistId": "OLAK5uy_kE1oquQlHqa_H8YJeHQ5Fw1aFJt4qlIjE",
    "displayGenre": "Folk, Singer-Songwriter, Female Vocalists",
    "categories": [
      "Folk",
      "Female Vocalists"
    ],
    "spotifyAlbumId": "1vz94WpXDVYIEGja8cjFNa"
  },
  {
    "id": 7,
    "rank": 7,
    "title": "Ágætis Byrjun",
    "artist": "Sigur Rós",
    "year": 1999,
    "genre": "Post-Rock, Ambient",
    "coverImage": "/images/albums/_g_tis_byrjun_sigur_r_s.jpg",
    "description": "1268",
    "youtubePlaylistId": "OLAK5uy_m1ecKXUh3U0xu2GwtSBIwznmWjVWD61EE",
    "displayGenre": "Post-Rock, Ambient",
    "categories": [
      "Electronic"
    ],
    "spotifyAlbumId": "1DMMv1Kmoli3Y9fVEZDUVC"
  },
  {
    "id": 8,
    "rank": 8,
    "title": "In The Aeroplane Over The Sea",
    "artist": "Neutral Milk Hotel",
    "year": 1998,
    "genre": "Indie, Indie Rock, Folk",
    "coverImage": "/images/albums/in_the_aeroplane_over_the_sea_neutral_milk_hotel.jpg",
    "description": "970",
    "youtubePlaylistId": "OLAK5uy_nOx8AXAeiL92BmZv5ss13uKbkWGRXs79E",
    "displayGenre": "Indie, Indie Rock, Folk",
    "categories": [
      "Alternative",
      "Rock",
      "Folk"
    ],
    "spotifyAlbumId": "0vVekV45lOaVKs6RZQQNob"
  },
  {
    "id": 9,
    "rank": 9,
    "title": "The Velvet Underground & Nico",
    "artist": "The Velvet Underground & Nico",
    "year": 1967,
    "genre": "Art Rock, Experimental Rock, Psychedelic Rock",
    "coverImage": "/images/albums/the_velvet_underground___nico_the_velvet_underground___nico.jpg",
    "description": "302",
    "youtubePlaylistId": "OLAK5uy_ngt5QCFCxWPcpApM_frvpcbOKJPtAKbpo",
    "displayGenre": "Art Rock, Experimental Rock, Psychedelic Rock",
    "categories": [
      "Rock"
    ],
    "spotifyAlbumId": "4xwx0x7k6c5VuThz5qVqmV"
  },
  {
    "id": 10,
    "rank": 10,
    "title": "Illmatic",
    "artist": "Nas",
    "year": 1994,
    "genre": "Hip-Hop",
    "coverImage": "/images/albums/illmatic_nas.jpg",
    "description": "2441",
    "youtubePlaylistId": "OLAK5uy_mfR8HPzH9f-VXdBe40SF3iRxcrLRvFg30",
    "displayGenre": "Hip-Hop",
    "categories": [
      "Hip-Hop"
    ],
    "spotifyAlbumId": "3kEtdS2pH6hKcMU9Wioob1"
  },
  {
    "id": 11,
    "rank": 11,
    "title": "OK Computer",
    "artist": "Radiohead",
    "year": 1997,
    "genre": "Alternative Rock, Alternative",
    "coverImage": "/images/albums/ok_computer_radiohead.jpg",
    "description": "227",
    "youtubePlaylistId": "OLAK5uy_nEGbRK3IZ018QZqnVmZtq-0k-vtJdysnA",
    "displayGenre": "Alternative Rock, Alternative",
    "categories": [
      "Rock",
      "Alternative"
    ],
    "spotifyAlbumId": "6dVIqQ8qmQ5GBnJ9shOYGE"
  },
  {
    "id": 12,
    "rank": 12,
    "title": "The Eminem Show",
    "artist": "Eminem",
    "year": 2002,
    "genre": "Hip-Hop",
    "coverImage": "/images/albums/the_eminem_show_eminem.jpg",
    "description": "1521",
    "youtubePlaylistId": "OLAK5uy_k3OeCvxsTsJJq5BPfh9gHvFuPNng2kIWk",
    "displayGenre": "Hip-Hop",
    "categories": [
      "Hip-Hop"
    ],
    "spotifyAlbumId": "2cWBwpqMsDJC1ZUwz813lo"
  },
  {
    "id": 13,
    "rank": 13,
    "title": "Doolittle",
    "artist": "Pixies",
    "year": 1989,
    "genre": "Alternative Rock, Alternative, Rock",
    "coverImage": "/images/albums/doolittle_pixies.jpg",
    "description": "206",
    "youtubePlaylistId": "OLAK5uy_nyGwUonJ0qUih88Bu51Z2bCUlbGN-KWoI",
    "displayGenre": "Alternative Rock, Alternative, Rock",
    "categories": [
      "Rock",
      "Alternative"
    ],
    "spotifyAlbumId": "0DQyTVcDhK9wm0f6RaErWO"
  },
  {
    "id": 14,
    "rank": 14,
    "title": "In Rainbows",
    "artist": "Radiohead",
    "year": 2007,
    "genre": "Alternative, Alternative Rock, Rock",
    "coverImage": "/images/albums/in_rainbows_radiohead.jpg",
    "description": "1706",
    "youtubePlaylistId": "OLAK5uy_lvqkQRb8iVo2obChPXi9XFRLoIyaxbTj8",
    "displayGenre": "Alternative, Alternative Rock, Rock",
    "categories": [
      "Alternative",
      "Rock"
    ],
    "spotifyAlbumId": "5vkqYmiPBYLaalcmjujWxK"
  },
  {
    "id": 15,
    "rank": 15,
    "title": "Let England Shake",
    "artist": "PJ Harvey",
    "year": 2011,
    "genre": "Alternative, Rock",
    "coverImage": "/images/albums/let_england_shake_pj_harvey.jpg",
    "description": "14096",
    "youtubePlaylistId": "OLAK5uy_n41WQ2o7I96dSnqE89CJUeuRaZm3QMTRY",
    "displayGenre": "Alternative, Rock",
    "categories": [
      "Alternative",
      "Rock"
    ],
    "spotifyAlbumId": "2JfiVMvVhdueC48EmskS7t"
  },
  {
    "id": 16,
    "rank": 16,
    "title": "Abbey Road",
    "artist": "The Beatles",
    "year": 1969,
    "genre": "Rock",
    "coverImage": "/images/albums/abbey_road_the_beatles.jpg",
    "description": "24",
    "youtubePlaylistId": "OLAK5uy_k2JcEE3_maNjnVBKU2s1JjhaZ4rxwgaME",
    "displayGenre": "Rock",
    "categories": [
      "Rock"
    ],
    "spotifyAlbumId": "0ETFjACtuP2ADo6LFhL6HN"
  },
  {
    "id": 17,
    "rank": 17,
    "title": "The Slim Shady LP",
    "artist": "Eminem",
    "year": 1999,
    "genre": "Hip-Hop",
    "coverImage": "/images/albums/the_slim_shady_lp_eminem.jpg",
    "description": "100",
    "youtubePlaylistId": "OLAK5uy_kqHXZBl9FyDtb2UckFaLtvT2L0HLVnqTs",
    "displayGenre": "Hip-Hop",
    "categories": [
      "Hip-Hop"
    ],
    "spotifyAlbumId": "0vE6mttRTBXRe9rKghyr1l"
  },
  {
    "id": 18,
    "rank": 18,
    "title": "The Velvet Underground",
    "artist": "The Velvet Underground",
    "year": 1969,
    "genre": "Art Rock, Experimental Rock",
    "coverImage": "/images/albums/the_velvet_underground_the_velvet_underground.jpg",
    "description": "301",
    "youtubePlaylistId": "OLAK5uy_lhdpySsfvUL_e9yjflV_DQvB0KZfHrYHQ",
    "displayGenre": "Art Rock, Experimental Rock",
    "categories": [
      "Rock"
    ],
    "spotifyAlbumId": "2Cdd4W17oumNihEt2aPNJB"
  },
  {
    "id": 19,
    "rank": 19,
    "title": "Revolver",
    "artist": "The Beatles",
    "year": 1966,
    "genre": "Rock",
    "coverImage": "/images/albums/revolver_the_beatles.jpg",
    "description": "28",
    "youtubePlaylistId": "OLAK5uy_n9q-ezB2RZF1WS7PR3h3drrTgNCf-DRSk",
    "displayGenre": "Rock",
    "categories": [
      "Rock"
    ],
    "spotifyAlbumId": "3PRoXYsngSwjEQWR5PsHWR"
  },
  {
    "id": 20,
    "rank": 20,
    "title": "The Queen Is Dead",
    "artist": "The Smiths",
    "year": 1986,
    "genre": "Alternative Rock, Alternative",
    "coverImage": "/images/albums/the_queen_is_dead_the_smiths.jpg",
    "description": "259",
    "youtubePlaylistId": "OLAK5uy_klS8Pn413KiwpcfIJpyE2aghZDLqAE-dY",
    "displayGenre": "Alternative Rock, Alternative",
    "categories": [
      "Rock",
      "Alternative"
    ],
    "spotifyAlbumId": "5Y0p2XCgRRIjna91aQE8q7"
  },
  {
    "id": 21,
    "rank": 21,
    "title": "Blonde On Blonde",
    "artist": "Bob Dylan",
    "year": 1966,
    "genre": "Folk Rock, Rock",
    "coverImage": "/images/albums/blonde_on_blonde_bob_dylan.jpg",
    "description": "44",
    "youtubePlaylistId": "OLAK5uy_nbJEu2bei2ZKwYjx26ZJEbjF8rBFqAb6g",
    "displayGenre": "Folk Rock, Rock",
    "categories": [
      "Rock",
      "Folk"
    ],
    "spotifyAlbumId": "4NP1rhnsPdYpnyJP0p0k0L"
  },
  {
    "id": 22,
    "rank": 22,
    "title": "Funeral",
    "artist": "Arcade Fire",
    "year": 2004,
    "genre": "Indie Rock, Alternative",
    "coverImage": "/images/albums/funeral_arcade_fire.jpg",
    "description": "1051",
    "youtubePlaylistId": "OLAK5uy_mUItEx7wND_P-iRSSgRiUo33fhJdFUL5E",
    "displayGenre": "Indie Rock, Alternative",
    "categories": [
      "Rock",
      "Alternative"
    ],
    "spotifyAlbumId": "6ZB8qaR9JNuS0Q0bG1nbcH"
  },
  {
    "id": 23,
    "rank": 23,
    "title": "Untitled (Led Zeppelin IV)",
    "artist": "Led Zeppelin",
    "year": 1971,
    "genre": "Hard Rock, Rock",
    "coverImage": "/images/albums/untitled__led_zeppelin_iv__led_zeppelin.jpg",
    "description": "144",
    "youtubePlaylistId": "OLAK5uy_miixGWs374VbB0oCVRHZ2JWssBydwz7V8",
    "displayGenre": "Hard Rock, Rock",
    "categories": [
      "Rock"
    ],
    "spotifyAlbumId": "44Ig8dzqOkvkGDzaUof9lK"
  },
  {
    "id": 24,
    "rank": 24,
    "title": "The Marshall Mathers LP",
    "artist": "Eminem",
    "year": 2000,
    "genre": "Hip-Hop",
    "coverImage": "/images/albums/the_marshall_mathers_lp_eminem.jpg",
    "description": "99",
    "youtubePlaylistId": "OLAK5uy_nyRZBNr6_NOMq4osjNSBbB7xpS2L_AH8w",
    "displayGenre": "Hip-Hop",
    "categories": [
      "Hip-Hop"
    ],
    "spotifyAlbumId": "6t7956yu5zYf5A829XRiHC"
  },
  {
    "id": 25,
    "rank": 25,
    "title": "I'm Wide Awake, It's Morning",
    "artist": "Bright Eyes",
    "year": 2005,
    "genre": "Indie Folk, Folk",
    "coverImage": "/images/albums/i_m_wide_awake__it_s_morning_bright_eyes.jpg",
    "description": "1255",
    "youtubePlaylistId": "OLAK5uy_koFDMOscWBYpgvTXOMeOpbjucMEEVGsyU",
    "displayGenre": "Indie Folk, Folk",
    "categories": [
      "Folk",
      "Alternative"
    ],
    "spotifyAlbumId": "6MwSuZphL6GmuSVIYUGUF7"
  },
  {
    "id": 26,
    "rank": 26,
    "title": "Sgt. Pepper's Lonely Hearts Club Band",
    "artist": "The Beatles",
    "year": 1967,
    "genre": "Rock, Psychedelic Rock",
    "coverImage": "/images/albums/sgt__pepper_s_lonely_hearts_club_band_the_beatles.jpg",
    "description": "30",
    "youtubePlaylistId": "OLAK5uy_l1fLqzoVl2yWsS4MqdiLyNQk9PGU1--8E",
    "displayGenre": "Rock, Psychedelic Rock",
    "categories": [
      "Rock"
    ],
    "spotifyAlbumId": "6QaVfG1pHYl1z15ZxkvVDW"
  },
  {
    "id": 27,
    "rank": 27,
    "title": "The Milk-Eyed Mender",
    "artist": "Joanna Newsom",
    "year": 2004,
    "genre": "Folk, Indie Folk",
    "coverImage": "/images/albums/the_milk_eyed_mender_joanna_newsom.jpg",
    "description": "3535",
    "youtubePlaylistId": "OLAK5uy_mbXkm4fLzwZeA2U9o-PLNhxmlx3eht3Is",
    "displayGenre": "Folk, Indie Folk",
    "categories": [
      "Folk"
    ],
    "spotifyAlbumId": ""
  },
  {
    "id": 28,
    "rank": 28,
    "title": "Portishead",
    "artist": "Portishead",
    "year": 1997,
    "genre": "Trip-Hop, Electronic",
    "coverImage": "/images/albums/portishead_portishead.jpg",
    "description": "2456",
    "youtubePlaylistId": "OLAK5uy_lHP8eobQ-BnaFkFZ-kMwkph_XxQ5Uj-os",
    "displayGenre": "Trip-Hop, Electronic",
    "categories": [
      "Electronic"
    ],
    "spotifyAlbumId": "3539EbNgIdEDGBKkUf4wno"
  },
  {
    "id": 29,
    "rank": 29,
    "title": "The Low End Theory",
    "artist": "A Tribe Called Quest",
    "year": 1991,
    "genre": "Hip-Hop, Jazz Rap",
    "coverImage": "/images/albums/the_low_end_theory_a_tribe_called_quest.jpg",
    "description": "2729",
    "youtubePlaylistId": "OLAK5uy_mWfUMAcfH8fZG8LLyrsRumBTJLy-j986E",
    "displayGenre": "Hip-Hop, Jazz Rap",
    "categories": [
      "Hip-Hop"
    ],
    "spotifyAlbumId": "1p12OAWwudgMqfMzjMvl2a"
  },
  {
    "id": 30,
    "rank": 30,
    "title": "Rubber Soul",
    "artist": "The Beatles",
    "year": 1965,
    "genre": "Rock, Folk Rock",
    "coverImage": "/images/albums/rubber_soul_the_beatles.jpg",
    "description": "29",
    "youtubePlaylistId": "OLAK5uy_lvTG69VbZm3r3r9crRBvT1Tj305YEbuaM",
    "displayGenre": "Rock, Folk Rock",
    "categories": [
      "Rock"
    ],
    "spotifyAlbumId": "50o7kf2wLwVmOTVYJOTplm"
  },
  {
    "id": 31,
    "rank": 31,
    "title": "Homogenic",
    "artist": "Björk",
    "year": 1997,
    "genre": "Electronic, Trip-Hop",
    "coverImage": "/images/albums/homogenic_bj_rk.jpg",
    "description": "1289",
    "youtubePlaylistId": "OLAK5uy_mw9Bb_0yJljnRsT_PFQ8pSKE_eDsQbL4k",
    "displayGenre": "Electronic, Trip-Hop",
    "categories": [
      "Electronic"
    ],
    "spotifyAlbumId": "0HMsmYvoT1h2x1C4di5faf"
  },
  {
    "id": 32,
    "rank": 32,
    "title": "Houses Of The Holy",
    "artist": "Led Zeppelin",
    "year": 1973,
    "genre": "Hard Rock, Rock",
    "coverImage": "/images/albums/houses_of_the_holy_led_zeppelin.jpg",
    "description": "1457",
    "youtubePlaylistId": "OLAK5uy_niaDyHupP8JZOc6gJkhf23ug7XINFT4wI",
    "displayGenre": "Hard Rock, Rock",
    "categories": [
      "Rock"
    ],
    "spotifyAlbumId": "0GqpoHJREPp0iuXK3HzrHk"
  },
  {
    "id": 33,
    "rank": 33,
    "title": "Come Away With Me",
    "artist": "Norah Jones",
    "year": 2002,
    "genre": "Jazz, Pop",
    "coverImage": "/images/albums/come_away_with_me_norah_jones.jpg",
    "description": "1510",
    "youtubePlaylistId": "OLAK5uy_mvBC9UtG8Uim6RfcOEWo5r671MbSL7Xe4",
    "displayGenre": "Jazz, Pop",
    "categories": [
      "Jazz"
    ],
    "spotifyAlbumId": "3ArSFkv4OQOosOvYTrZNIl"
  },
  {
    "id": 34,
    "rank": 34,
    "title": "Rumours",
    "artist": "Fleetwood Mac",
    "year": 1977,
    "genre": "Soft Rock, Rock",
    "coverImage": "/images/albums/rumours_fleetwood_mac.jpg",
    "description": "101",
    "youtubePlaylistId": "OLAK5uy_nVaA0orpORfdRjNAGyfMZhGkvrYkkgMHI",
    "displayGenre": "Soft Rock, Rock",
    "categories": [
      "Rock"
    ],
    "spotifyAlbumId": "0BwWUstDMUbgq2NYONRqlu"
  },
  {
    "id": 35,
    "rank": 35,
    "title": "The Glow Pt. 2",
    "artist": "The Microphones",
    "year": 2001,
    "genre": "Indie Rock, Lo-Fi",
    "coverImage": "/images/albums/the_glow_pt__2_the_microphones.jpg",
    "description": "2696",
    "youtubePlaylistId": "OLAK5uy_k79Z1FevqgQ4s9oO9dfRo0jwP7M-26JiA",
    "displayGenre": "Indie Rock, Lo-Fi",
    "categories": [
      "Rock",
      "Alternative"
    ],
    "spotifyAlbumId": "6QYoRO2sXThCORAifrP4Bl"
  },
  {
    "id": 36,
    "rank": 36,
    "title": "The Black Album",
    "artist": "Jay-Z",
    "year": 2003,
    "genre": "Hip-Hop",
    "coverImage": "/images/albums/the_black_album_jay_z.jpg",
    "description": "7569",
    "youtubePlaylistId": "OLAK5uy_mdavaKa6H8395K5mq9VOWUMNz6caZH2Qs",
    "displayGenre": "Hip-Hop",
    "categories": [
      "Hip-Hop"
    ],
    "spotifyAlbumId": "4FWvo9oS4gRgHtAwDwUjiO"
  },
  {
    "id": 37,
    "rank": 37,
    "title": "Takk...",
    "artist": "Sigur Rós",
    "year": 2005,
    "genre": "Post-Rock, Ambient",
    "coverImage": "/images/albums/takk____sigur_r_s.jpg",
    "description": "2055",
    "youtubePlaylistId": "",
    "youtubeMusicId": "_GozH0kZcDs",
    "displayGenre": "Post-Rock, Ambient",
    "categories": [
      "Electronic"
    ],
    "spotifyAlbumId": "12tw1A9HmwE3MHvPfHhdoP"
  },
  {
    "id": 38,
    "rank": 38,
    "title": "Led Zeppelin",
    "artist": "Led Zeppelin",
    "year": 1969,
    "genre": "Hard Rock, Rock",
    "coverImage": "/images/albums/led_zeppelin_i_led_zeppelin.jpg",
    "description": "142",
    "youtubePlaylistId": "OLAK5uy_kBuigfoB79x8bX2p32UZw1DcZHo7bkMWA",
    "displayGenre": "Hard Rock, Rock",
    "categories": [
      "Rock"
    ],
    "spotifyAlbumId": "3ycjBixZf7S3WpC5WZhhUK"
  },
  {
    "id": 39,
    "rank": 39,
    "title": "Madvillainy",
    "artist": "Madvillain",
    "year": 2004,
    "genre": "Hip-Hop, Experimental Hip-Hop",
    "coverImage": "/images/albums/madvillainy_madvillain.jpg",
    "description": "2546",
    "youtubePlaylistId": "OLAK5uy_nf8bBBv8PcA9wGIQUdlusX16tLRHCqbuk",
    "displayGenre": "Hip-Hop, Experimental Hip-Hop",
    "categories": [
      "Hip-Hop"
    ],
    "spotifyAlbumId": "19bQiwEKhXUBJWY6oV3KZk"
  },
  {
    "id": 40,
    "rank": 40,
    "title": "Back To Black",
    "artist": "Amy Winehouse",
    "year": 2006,
    "genre": "Soul, R&B",
    "coverImage": "/images/albums/back_to_black_amy_winehouse.jpg",
    "description": "1843",
    "youtubePlaylistId": "OLAK5uy_nAjbZN5NnOMUl-MIqnjdAXxONelv8qYZI",
    "displayGenre": "Soul, R&B",
    "categories": [
      "R&B"
    ],
    "spotifyAlbumId": "0E4xv5gPjykrwBgBZzI8XG"
  },
  {
    "id": 41,
    "rank": 41,
    "title": "Just Another Diamond Day",
    "artist": "Vashti Bunyan",
    "year": 1970,
    "genre": "Folk, Psychedelic Folk",
    "coverImage": "/images/albums/just_another_diamond_day_vashti_bunyan.jpg",
    "description": "5707",
    "youtubePlaylistId": "OLAK5uy_niAQbVlOKbtFI6OeAmDN1sPbRuddT8fbA",
    "displayGenre": "Folk, Psychedelic Folk",
    "categories": [
      "Folk"
    ],
    "spotifyAlbumId": "6BjFznpsyrxCFMpp3hzlD2"
  },
  {
    "id": 42,
    "rank": 42,
    "title": "Illinois",
    "artist": "Sufjan Stevens",
    "year": 2005,
    "genre": "Indie Folk, Folk",
    "coverImage": "/images/albums/illinois_sufjan_stevens.jpg",
    "description": "1394",
    "youtubePlaylistId": "OLAK5uy_mvDMUbRUk-QGWlDE2O6SLwuKxyQr_3t44",
    "displayGenre": "Indie Folk, Folk",
    "categories": [
      "Folk",
      "Alternative"
    ],
    "spotifyAlbumId": "1pOl0KEC1iQnA6F0XxV4To"
  },
  {
    "id": 43,
    "rank": 43,
    "title": "White Chalk",
    "artist": "PJ Harvey",
    "year": 2007,
    "genre": "Alternative, Rock",
    "coverImage": "/images/albums/white_chalk_pj_harvey.jpg",
    "description": "3299",
    "youtubePlaylistId": "OLAK5uy_mm-uoZEsWDq2A8FYVyk7zc3ynF_nWVPGc",
    "displayGenre": "Alternative, Rock",
    "categories": [
      "Alternative",
      "Rock"
    ],
    "spotifyAlbumId": "4IeJySFMS6reB6BeYzMp5j"
  },
  {
    "id": 44,
    "rank": 44,
    "title": "The Miseducation Of Lauryn Hill",
    "artist": "Lauryn Hill",
    "year": 1998,
    "genre": "Hip-Hop, R&B",
    "coverImage": "/images/albums/the_miseducation_of_lauryn_hill_lauryn_hill.jpg",
    "description": "141",
    "youtubePlaylistId": "OLAK5uy_lRo6wUst04Buqa-V-E55zmc2Dl_571ROs",
    "displayGenre": "Hip-Hop, R&B",
    "categories": [
      "Hip-Hop",
      "R&B"
    ],
    "spotifyAlbumId": "1BZoqf8Zje5nGdwZhOjAtD"
  },
  {
    "id": 45,
    "rank": 45,
    "title": "Painted Shut",
    "artist": "Hop Along",
    "year": 2015,
    "genre": "Indie Rock, Alternative",
    "coverImage": "/images/albums/painted_shut_hop_along.jpg",
    "description": "79797",
    "youtubePlaylistId": "OLAK5uy_mPgWDYCKhuuGqF4KWwk3TknwFTOyxW-OY",
    "displayGenre": "Indie Rock, Alternative",
    "categories": [
      "Rock",
      "Alternative"
    ],
    "spotifyAlbumId": "7bR9KYRb6jfhlle5Y9U4BD"
  },
  {
    "id": 46,
    "rank": 46,
    "title": "Ready To Die",
    "artist": "The Notorious B.I.G.",
    "year": 1994,
    "genre": "Hip-Hop",
    "coverImage": "/images/albums/ready_to_die_the_notorious_b_i_g_.jpg",
    "description": "1429",
    "youtubePlaylistId": "OLAK5uy_n5HRVh6M6hy1sRnmnH1iiiVzOfEzG52Qc",
    "displayGenre": "Hip-Hop",
    "categories": [
      "Hip-Hop"
    ],
    "spotifyAlbumId": "2HTbQ0RHwukKVXAlTmCZP2"
  },
  {
    "id": 47,
    "rank": 47,
    "title": "MTV Unplugged In New York",
    "artist": "Nirvana",
    "year": 1994,
    "genre": "Alternative Rock, Grunge",
    "coverImage": "/images/albums/mtv_unplugged_in_new_york_nirvana.jpg",
    "description": "354",
    "youtubePlaylistId": "OLAK5uy_khF-bYQKOZrX9U1WH0-7z1xzssUd4q4_I",
    "displayGenre": "Alternative Rock, Grunge",
    "categories": [
      "Rock",
      "Alternative"
    ],
    "spotifyAlbumId": "1To7kv722A8SpZF789MZy7"
  },
  {
    "id": 48,
    "rank": 48,
    "title": "Odelay",
    "artist": "Beck",
    "year": 1996,
    "genre": "Alternative Rock, Experimental Rock",
    "coverImage": "/images/albums/odelay_beck.jpg",
    "description": "33",
    "youtubePlaylistId": "OLAK5uy_msqE7SnQagEUphN4aLMfXu-QaIYNGDXVk",
    "displayGenre": "Alternative Rock, Experimental Rock",
    "categories": [
      "Rock",
      "Alternative"
    ],
    "spotifyAlbumId": "1Pus5h1qGedCn4CtOuPVtp"
  },
  {
    "id": 49,
    "rank": 49,
    "title": "Led Zeppelin II",
    "artist": "Led Zeppelin",
    "year": 1969,
    "genre": "Hard Rock, Rock",
    "coverImage": "/images/albums/led_zeppelin_ii_led_zeppelin.jpg",
    "description": "143",
    "youtubePlaylistId": "PLMmd10177iHvfOoVrmqroN6fvGYZFc8Kr",
    "displayGenre": "Hard Rock, Rock",
    "categories": [
      "Rock"
    ],
    "spotifyAlbumId": "58MQ0PLijVHePUonQlK76Y"
  },
  {
    "id": 50,
    "rank": 50,
    "title": "Chutes Too Narrow",
    "artist": "The Shins",
    "year": 2003,
    "genre": "Indie Rock, Alternative",
    "coverImage": "/images/albums/chutes_too_narrow_the_shins.jpg",
    "description": "1014",
    "youtubePlaylistId": "OLAK5uy_l8-uav5OH3vr9p9KZk0GwG4XuHl7_s12U",
    "displayGenre": "Indie Rock, Alternative",
    "categories": [
      "Rock",
      "Alternative"
    ],
    "spotifyAlbumId": "2fxQs4i9HfyRME7zjp0ZnB"
  },
  {
    "id": 51,
    "rank": 51,
    "title": "The Bends",
    "artist": "Radiohead",
    "year": 1995,
    "genre": "Alternative Rock, Rock",
    "coverImage": "/images/albums/the_bends_radiohead.jpg",
    "description": "228",
    "youtubePlaylistId": "OLAK5uy_mcdDsRfBo6p9yWwUCOLxjSMVV9sd2LjtU",
    "displayGenre": "Alternative Rock, Rock",
    "categories": [
      "Rock",
      "Alternative"
    ],
    "spotifyAlbumId": "35UJLpClj5EDrhpNIi4DFg"
  },
  {
    "id": 52,
    "rank": 52,
    "title": "Paul's Boutique",
    "artist": "Beastie Boys",
    "year": 1989,
    "genre": "Hip-Hop",
    "coverImage": "/images/albums/paul_s_boutique_beastie_boys.jpg",
    "description": "22",
    "youtubePlaylistId": "OLAK5uy_nqPWHD8c9N4DnlFGUg4DVqFQvupzxFSkA",
    "displayGenre": "Hip-Hop",
    "categories": [
      "Hip-Hop"
    ],
    "spotifyAlbumId": "1kmyirVya5fRxdjsPFDM05"
  },
  {
    "id": 53,
    "rank": 53,
    "title": "Seven Swans",
    "artist": "Sufjan Stevens",
    "year": 2004,
    "genre": "Indie Folk, Folk",
    "coverImage": "/images/albums/seven_swans_sufjan_stevens.jpg",
    "description": "1185",
    "youtubePlaylistId": "OLAK5uy_mGp-1f2AMsWo_HHkyDYb-d4EIHN2aTroA",
    "displayGenre": "Indie Folk, Folk",
    "categories": [
      "Folk",
      "Alternative"
    ],
    "spotifyAlbumId": "1WZ9u1VDIih007LAC6VfpA"
  },
  {
    "id": 54,
    "rank": 54,
    "title": "Masterpiece",
    "artist": "Big Thief",
    "year": 2016,
    "genre": "Indie Rock, Alternative",
    "coverImage": "/images/albums/masterpiece_big_thief.jpg",
    "description": "97844",
    "youtubePlaylistId": "OLAK5uy_nCB2WzxScVjfaBfmcOqw2PO28BtARnDY8",
    "displayGenre": "Indie Rock, Alternative",
    "categories": [
      "Rock",
      "Alternative"
    ],
    "spotifyAlbumId": "3dtiO2Vs4YZQOFCOCDgtxL"
  },
  {
    "id": 55,
    "rank": 55,
    "title": "The Dark Side Of The Moon",
    "artist": "Pink Floyd",
    "year": 1973,
    "genre": "Progressive Rock, Rock",
    "coverImage": "/images/albums/the_dark_side_of_the_moon_pink_floyd.jpg",
    "description": "203",
    "youtubePlaylistId": "OLAK5uy_l1x-JAx0w53suECoCI0YJtW6VB8DBQWRQ",
    "displayGenre": "Progressive Rock, Rock",
    "categories": [
      "Rock"
    ],
    "spotifyAlbumId": "4LH4d3cOWNNsVw41Gqt2kv"
  },
  {
    "id": 56,
    "rank": 56,
    "title": "Midnight Marauders",
    "artist": "A Tribe Called Quest",
    "year": 1993,
    "genre": "Hip-Hop, Jazz Rap",
    "coverImage": "/images/albums/midnight_marauders_a_tribe_called_quest.jpg",
    "description": "2387",
    "youtubePlaylistId": "OLAK5uy_ncxk2dzMeB4E9vgbWeMvM_O_SydgJR2C0",
    "displayGenre": "Hip-Hop, Jazz Rap",
    "categories": [
      "Hip-Hop"
    ],
    "spotifyAlbumId": "4v5x3Oo3UjQ9YmF3hRAip5"
  },
  {
    "id": 57,
    "rank": 57,
    "title": "Transatlanticism",
    "artist": "Death Cab For Cutie",
    "year": 2003,
    "genre": "Indie Rock, Alternative",
    "coverImage": "/images/albums/transatlanticism_death_cab_for_cutie.jpg",
    "description": "2561",
    "youtubePlaylistId": "OLAK5uy_ldP2Ead4onWb3hLGkZ3Y_u3Teprg3QrrQ",
    "displayGenre": "Indie Rock, Alternative",
    "categories": [
      "Rock",
      "Alternative"
    ],
    "spotifyAlbumId": "5UKAhD2VmFAuThgq4OQyEe"
  },
  {
    "id": 58,
    "rank": 58,
    "title": "Resurrection",
    "artist": "Common Sense",
    "year": 1994,
    "genre": "Hip-Hop",
    "coverImage": "/images/albums/resurrection_common_sense.jpg",
    "description": "4443",
    "youtubePlaylistId": "OLAK5uy_lhxMjLEpeMH6CrTv45bOgUkVSOwDZ498I",
    "displayGenre": "Hip-Hop",
    "categories": [
      "Hip-Hop"
    ],
    "spotifyAlbumId": "0JKjuvDUPrnlblAZyB1Aje"
  },
  {
    "id": 59,
    "rank": 59,
    "title": "Lifestylez Ov Da Poor & Dangerous",
    "artist": "Big L",
    "year": 1995,
    "genre": "Hip-Hop",
    "coverImage": "/images/albums/lifestylez_ov_da_poor___dangerous_big_l.jpg",
    "description": "6161",
    "youtubePlaylistId": "OLAK5uy_nFrgsPc849Usb009UoipkFDS4meK3SFls",
    "displayGenre": "Hip-Hop",
    "categories": [
      "Hip-Hop"
    ],
    "spotifyAlbumId": "7xvBUHu5jJ7X0wdRHudLFD"
  },
  {
    "id": 60,
    "rank": 60,
    "title": "Liquid Swords",
    "artist": "GZA",
    "year": 1995,
    "genre": "Hip-Hop",
    "coverImage": "/images/albums/liquid_swords_gza_genius.jpg",
    "description": "3034",
    "youtubePlaylistId": "OLAK5uy_lc3DfmJHwd5x75Cmrh5IC8f0LB72eYjB4",
    "displayGenre": "Hip-Hop",
    "categories": [
      "Hip-Hop"
    ],
    "spotifyAlbumId": "3k8xoyOXkGgZxUKgpmxz4P"
  },
  {
    "id": 61,
    "rank": 61,
    "title": "Bark Your Head Off, Dog",
    "artist": "Hop Along",
    "year": 2018,
    "genre": "Indie Rock, Alternative",
    "coverImage": "/images/albums/bark_your_head_off__dog_hop_along.jpg",
    "description": "129645",
    "youtubePlaylistId": "OLAK5uy_nhwpvYrQeIKI9myjXlzmW4PIIXRx_SRdo",
    "displayGenre": "Indie Rock, Alternative",
    "categories": [
      "Rock",
      "Alternative"
    ],
    "spotifyAlbumId": "5S0GDz2d3EeTS6zb5oJeKI"
  },
  {
    "id": 62,
    "rank": 62,
    "title": "Tapestry",
    "artist": "Carole King",
    "year": 1971,
    "genre": "Soft Rock, Pop",
    "coverImage": "/images/albums/tapestry_carole_king.jpg",
    "description": "62",
    "youtubePlaylistId": "OLAK5uy_lUWnDcefuS7i1yv27EE5oZ87cRlQbm3EA",
    "displayGenre": "Soft Rock, Pop",
    "categories": [
      "Rock"
    ],
    "spotifyAlbumId": "12n11cgnpjXKLeqrnIERoS"
  },
  {
    "id": 63,
    "rank": 63,
    "title": "Time Out",
    "artist": "The Dave Brubeck Quartet",
    "year": 1959,
    "genre": "Jazz",
    "coverImage": "/images/albums/time_out_the_dave_brubeck_quartet.jpg",
    "description": "12507",
    "youtubePlaylistId": "OLAK5uy_nzNqlLAs3PLitt_FR1-_pO-1Vswhe8ff8",
    "displayGenre": "Jazz",
    "categories": [
      "Jazz"
    ],
    "spotifyAlbumId": "0nTTEAhCZsbbeplyDMIFuA"
  },
  {
    "id": 64,
    "rank": 64,
    "title": "Kid A",
    "artist": "Radiohead",
    "year": 2000,
    "genre": "Alternative Rock, Electronic",
    "coverImage": "/images/albums/kid_a_radiohead.jpg",
    "description": "1002",
    "youtubePlaylistId": "OLAK5uy_nZquM-iYg8ppQxrwe-KpcxH3FfcrL8smI",
    "displayGenre": "Alternative Rock, Electronic",
    "categories": [
      "Rock",
      "Alternative"
    ],
    "spotifyAlbumId": "6GjwtEZcfenmOf6l18N7T7"
  },
  {
    "id": 65,
    "rank": 65,
    "title": "American Beauty",
    "artist": "Grateful Dead",
    "year": 1970,
    "genre": "Folk Rock, Rock",
    "coverImage": "/images/albums/american_beauty_grateful_dead.jpg",
    "description": "1245",
    "youtubePlaylistId": "OLAK5uy_kZGGsSBwmZSn_K5NHHgvMC91rrmhWVa0A",
    "displayGenre": "Folk Rock, Rock",
    "categories": [
      "Rock",
      "Folk"
    ],
    "spotifyAlbumId": "2UDDZVesmQwA4aYfa55diS"
  },
  {
    "id": 66,
    "rank": 66,
    "title": "Yoshimi Battles The Pink Robots",
    "artist": "The Flaming Lips",
    "year": 2002,
    "genre": "Alternative Rock, Psychedelic Rock",
    "coverImage": "/images/albums/yoshimi_battles_the_pink_robots_the_flaming_lips.jpg",
    "description": "1309",
    "youtubePlaylistId": "OLAK5uy_nUVQvMU2o34YgR4tKZPfQp7Yl5v_EdGKs",
    "displayGenre": "Alternative Rock, Psychedelic Rock",
    "categories": [
      "Rock",
      "Alternative"
    ],
    "spotifyAlbumId": "49LA20VMk65fQyEaIzYdvf"
  },
  {
    "id": 67,
    "rank": 67,
    "title": "Fleet Foxes",
    "artist": "Fleet Foxes",
    "year": 2008,
    "genre": "Indie Folk, Folk",
    "coverImage": "/images/albums/fleet_foxes_fleet_foxes.jpg",
    "description": "3430",
    "youtubePlaylistId": "OLAK5uy_muUUJTW3e3aebLvjgJp0nyQqEN_GX5xmo",
    "displayGenre": "Indie Folk, Folk",
    "categories": [
      "Folk",
      "Alternative"
    ],
    "spotifyAlbumId": "5GRnydamKvIeG46dycID6v"
  },
  {
    "id": 68,
    "rank": 68,
    "title": "The Rise And Fall Of Ziggy Stardust And The Spiders From Mars",
    "artist": "David Bowie",
    "year": 1972,
    "genre": "Glam Rock, Rock",
    "coverImage": "/images/albums/the_rise_and_fall_of_ziggy_stardust_and_the_spiders_from_mars_david_bowie.jpg",
    "description": "74",
    "youtubePlaylistId": "OLAK5uy_lLqrDSsxVNgt7dqhjvnHtKh0PAHIDw5Lw",
    "displayGenre": "Glam Rock, Rock",
    "categories": [
      "Rock"
    ],
    "spotifyAlbumId": "48D1hRORqJq52qsnUYZX56"
  },
  {
    "id": 69,
    "rank": 69,
    "title": "Pet Sounds",
    "artist": "The Beach Boys",
    "year": 1966,
    "genre": "Pop, Psychedelic Pop",
    "coverImage": "/images/albums/pet_sounds_the_beach_boys.jpg",
    "description": "18",
    "youtubePlaylistId": "OLAK5uy_mJN3N2XYKY6P2RpKP_-Zk20HwDSewNAYY",
    "displayGenre": "Pop, Psychedelic Pop",
    "categories": [
      "Pop"
    ],
    "spotifyAlbumId": "2CNEkSE8TADXRT2AzcEt1b"
  },
  {
    "id": 70,
    "rank": 70,
    "title": "Arthur Or The Decline And Fall Of The British Empire",
    "artist": "The Kinks",
    "year": 1969,
    "genre": "Unknown",
    "coverImage": "/images/albums/arthur_or_the_decline_and_fall_of_the_british_empire_the_kinks.jpg",
    "description": "1684",
    "youtubePlaylistId": "OLAK5uy_kQUXZZkmam2R2TQvS7XQtPgC_zFofBF4U",
    "displayGenre": "Unknown",
    "categories": [
      "Unknown"
    ],
    "spotifyAlbumId": "5McXJRYbHlahdYE09eonkE"
  },
  {
    "id": 71,
    "rank": 71,
    "title": "Get Disowned",
    "artist": "Hop Along",
    "year": 2012,
    "genre": "Indie Rock, Alternative",
    "coverImage": "/images/albums/get_disowned_hop_along.jpg",
    "description": "43306",
    "youtubePlaylistId": "OLAK5uy_kIN7pKkncHcBpF92lbeZzRZMTxsI9knXY",
    "displayGenre": "Indie Rock, Alternative",
    "categories": [
      "Rock",
      "Alternative"
    ],
    "spotifyAlbumId": "0M21gt5nGY8lqVmCxQxEiL"
  },
  {
    "id": 72,
    "rank": 72,
    "title": "Oracular Spectacular",
    "artist": "MGMT",
    "year": 2007,
    "genre": "Indie Rock, Psychedelic Rock",
    "coverImage": "/images/albums/oracular_spectacular_mgmt.jpg",
    "description": "4169",
    "youtubePlaylistId": "OLAK5uy_kN24ZHnMBZNDvKNvFIE-WUYPZt1zdxW1Q",
    "displayGenre": "Indie Rock, Psychedelic Rock",
    "categories": [
      "Rock",
      "Alternative"
    ],
    "spotifyAlbumId": "6mm1Skz3JE6AXneya9Nyiv"
  },
  {
    "id": 73,
    "rank": 73,
    "title": "Beats, Rhymes And Life",
    "artist": "A Tribe Called Quest",
    "year": 1996,
    "genre": "Hip-Hop",
    "coverImage": "/images/albums/beats__rhymes_and_life_a_tribe_called_quest.jpg",
    "description": "14258",
    "youtubePlaylistId": "OLAK5uy_m34J6yHzu2Uv_gyrKGYDdmfLx-bNOUT8M",
    "displayGenre": "Hip-Hop",
    "categories": [
      "Hip-Hop"
    ],
    "spotifyAlbumId": "0EguP4tsJurU5I8ocCxdyb"
  },
  {
    "id": 74,
    "rank": 74,
    "title": "Magical Mystery Tour",
    "artist": "The Beatles",
    "year": 1967,
    "genre": "Psychedelic Rock, Rock",
    "coverImage": "/images/albums/magical_mystery_tour_the_beatles.jpg",
    "description": "1775",
    "youtubePlaylistId": "OLAK5uy_k5Ato-9KKa4z-PDiFvP5zg-PaSwj-ssZg",
    "displayGenre": "Psychedelic Rock, Rock",
    "categories": [
      "Rock"
    ],
    "spotifyAlbumId": "2BtE7qm1qzM80p9vLSiXkj"
  },
  {
    "id": 75,
    "rank": 75,
    "title": "Debut",
    "artist": "Björk",
    "year": 1993,
    "genre": "Electronic, Trip-Hop",
    "coverImage": "/images/albums/debut_bj_rk.jpg",
    "description": "39",
    "youtubePlaylistId": "OLAK5uy_lb2-vYgwNcRwJvGIWX-3rxoHXamUY0VvU",
    "displayGenre": "Electronic, Trip-Hop",
    "categories": [
      "Electronic"
    ],
    "spotifyAlbumId": "3icT9XGrBfhlV8BKK4WEGX"
  },
  {
    "id": 76,
    "rank": 76,
    "title": "To Bring You My Love",
    "artist": "PJ Harvey",
    "year": 1995,
    "genre": "Alternative Rock, Rock",
    "coverImage": "/images/albums/to_bring_you_my_love_pj_harvey.jpg",
    "description": "2357",
    "youtubePlaylistId": "OLAK5uy_k3ujfkWaaNdpBdB9B0O94tVzX7LZwykh4",
    "displayGenre": "Alternative Rock, Rock",
    "categories": [
      "Rock",
      "Alternative"
    ],
    "spotifyAlbumId": "2yMg8ronKfVDHngnlLNnl8"
  },
  {
    "id": 77,
    "rank": 77,
    "title": "Have One On Me",
    "artist": "Joanna Newsom",
    "year": 2010,
    "genre": "Folk, Singer-Songwriter",
    "coverImage": "/images/albums/have_one_on_me_joanna_newsom.jpg",
    "description": "9258",
    "youtubePlaylistId": "OLAK5uy_mGdaO3CeQB0T1tUs66svgLqflZNtjTv04",
    "displayGenre": "Folk, Singer-Songwriter",
    "categories": [
      "Folk"
    ],
    "spotifyAlbumId": ""
  },
  {
    "id": 78,
    "rank": 78,
    "title": "Good Kid, M.A.A.D City",
    "artist": "Kendrick Lamar",
    "year": 2012,
    "genre": "Hip-Hop",
    "coverImage": "/images/albums/good_kid__m_a_a_d_city_kendrick_lamar.jpg",
    "description": "31103",
    "youtubePlaylistId": "OLAK5uy_lS9HkMve0ec9D9wyWDVvRRKlNEl7E55h4",
    "displayGenre": "Hip-Hop",
    "categories": [
      "Hip-Hop"
    ],
    "spotifyAlbumId": "3DGQ1iZ9XKUQxAUWjfC34w"
  },
  {
    "id": 79,
    "rank": 79,
    "title": "The College Dropout",
    "artist": "Kanye West",
    "year": 2004,
    "genre": "Hip-Hop",
    "coverImage": "/images/albums/the_college_dropout_kanye_west.jpg",
    "description": "1836",
    "youtubePlaylistId": "OLAK5uy_l139P2p521JCZVZX8S_PuGFUKyD1brXWY",
    "displayGenre": "Hip-Hop",
    "categories": [
      "Hip-Hop"
    ],
    "spotifyAlbumId": "4Uv86qWpGTxf7fU7lG5X6F"
  },
  {
    "id": 80,
    "rank": 80,
    "title": "Is This It",
    "artist": "The Strokes",
    "year": 2001,
    "genre": "Indie Rock, Alternative",
    "coverImage": "/images/albums/is_this_it_the_strokes.jpg",
    "description": "279",
    "youtubePlaylistId": "OLAK5uy_kxPqiwIfVH7nzHfsH6gOCNB6FGpnJojNM",
    "displayGenre": "Indie Rock, Alternative",
    "categories": [
      "Rock",
      "Alternative"
    ],
    "spotifyAlbumId": "2k8KgmDp9oHrmu0MIj4XDE"
  },
  {
    "id": 81,
    "rank": 81,
    "title": "Remain In Light",
    "artist": "Talking Heads",
    "year": 1980,
    "genre": "New Wave, Rock",
    "coverImage": "/images/albums/remain_in_light_talking_heads.jpg",
    "description": "285",
    "youtubePlaylistId": "OLAK5uy_ldZpfPljmwhO4m7Eu8HUTylyh1uHT4wyY",
    "displayGenre": "New Wave, Rock",
    "categories": [
      "Rock",
      "Alternative"
    ],
    "spotifyAlbumId": "3AQgdwMNCiN7awXch5fAaG"
  },
  {
    "id": 82,
    "rank": 82,
    "title": "A Night At The Opera",
    "artist": "Queen",
    "year": 1975,
    "genre": "Rock, Progressive Rock",
    "coverImage": "/images/albums/a_night_at_the_opera_queen.jpg",
    "description": "223",
    "youtubePlaylistId": "OLAK5uy_mz4wksGpUUokxRpbyFKZ8pmRY51dWvDH8",
    "displayGenre": "Rock, Progressive Rock",
    "categories": [
      "Rock"
    ],
    "spotifyAlbumId": "6X9k3hSsvQck2OfKYdBbXr"
  },
  {
    "id": 83,
    "rank": 83,
    "title": "Head Hunters",
    "artist": "Herbie Hancock",
    "year": 1973,
    "genre": "Jazz, Jazz Fusion",
    "coverImage": "/images/albums/head_hunters_herbie_hancock.jpg",
    "description": "1812",
    "youtubePlaylistId": "OLAK5uy_m789U0dt-J4aLVd7p-dXJxSfDliep-NT0",
    "displayGenre": "Jazz, Jazz Fusion",
    "categories": [
      "Jazz"
    ],
    "spotifyAlbumId": "5fmIolILp5NAtNYiRPjhzA"
  },
  {
    "id": 84,
    "rank": 84,
    "title": "Aquemini",
    "artist": "OutKast",
    "year": 1998,
    "genre": "Hip-Hop",
    "coverImage": "/images/albums/aquemini_outkast.jpg",
    "description": "3507",
    "youtubePlaylistId": "OLAK5uy_ldV775EypimsbbnMj8XwxnPH8m2MhMLPo",
    "displayGenre": "Hip-Hop",
    "categories": [
      "Hip-Hop"
    ],
    "spotifyAlbumId": "5ceB3rxgXqIRpsOvVzTG28"
  },
  {
    "id": 85,
    "rank": 85,
    "title": "Yankee Hotel Foxtrot",
    "artist": "Wilco",
    "year": 2002,
    "genre": "Indie Rock, Alternative",
    "coverImage": "/images/albums/yankee_hotel_foxtrot_wilco.jpg",
    "description": "1389",
    "youtubePlaylistId": "OLAK5uy_laN2Lq2HJZ02XTp387n0Tiem1ZiDkDpk4",
    "displayGenre": "Indie Rock, Alternative",
    "categories": [
      "Rock",
      "Alternative"
    ],
    "spotifyAlbumId": "4jVVAenBaHRF8w0MV6qKw7"
  },
  {
    "id": 86,
    "rank": 86,
    "title": "Axis: Bold As Love",
    "artist": "The Jimi Hendrix Experience",
    "year": 1967,
    "genre": "Psychedelic Rock, Rock",
    "coverImage": "/images/albums/axis__bold_as_love_the_jimi_hendrix_experience.jpg",
    "description": "126",
    "youtubePlaylistId": "OLAK5uy_lWur3SpNnxqZ_ad3ovCDjRSTCmjYYR6i8",
    "displayGenre": "Psychedelic Rock, Rock",
    "categories": [
      "Rock"
    ],
    "spotifyAlbumId": "3uFZf8rykoHo7XMIQVYW6r"
  },
  {
    "id": 87,
    "rank": 87,
    "title": "Malibu",
    "artist": "Anderson .Paak",
    "year": 2016,
    "genre": "Hip-Hop, R&B",
    "coverImage": "/images/albums/malibu_anderson__paak.jpg",
    "description": "92476",
    "youtubePlaylistId": "OLAK5uy_lFT9sQte1ajfUk3lCO0UqdqIkQvNW5ayY",
    "displayGenre": "Hip-Hop, R&B",
    "categories": [
      "Hip-Hop",
      "R&B"
    ],
    "spotifyAlbumId": "4VFG1DOuTeDMBjBLZT7hCK"
  },
  {
    "id": 88,
    "rank": 88,
    "title": "What's Going On",
    "artist": "Marvin Gaye",
    "year": 1971,
    "genre": "Soul, R&B",
    "coverImage": "/images/albums/what_s_going_on_marvin_gaye.jpg",
    "description": "159",
    "youtubePlaylistId": "OLAK5uy_krxU85sRSpvmZqiwHyVmYNhKBDVgvj-CE",
    "displayGenre": "Soul, R&B",
    "categories": [
      "R&B"
    ],
    "spotifyAlbumId": "2v6ANhWhZBUKkg6pJJBs3B"
  },
  {
    "id": 89,
    "rank": 89,
    "title": "Maggot Brain",
    "artist": "Funkadelic",
    "year": 1971,
    "genre": "Funk, Psychedelic Rock",
    "coverImage": "/images/albums/maggot_brain_funkadelic.jpg",
    "description": "1170",
    "youtubePlaylistId": "OLAK5uy_kskyBqsNZRktxjJ4I2ap8LC3EvkjeGqSg",
    "displayGenre": "Funk, Psychedelic Rock",
    "categories": [
      "Rock"
    ],
    "spotifyAlbumId": "3ywVzrwMQ3Kq43N9zBdBQm"
  },
  {
    "id": 90,
    "rank": 90,
    "title": "Baduizm",
    "artist": "Erykah Badu",
    "year": 1997,
    "genre": "Neo Soul, R&B",
    "coverImage": "/images/albums/baduizm_erykah_badu.jpg",
    "description": "3923",
    "youtubePlaylistId": "OLAK5uy_nRpuCYXBRs7FMe2lbktXYQqk4X-CC1f8I",
    "displayGenre": "Neo Soul, R&B",
    "categories": [
      "R&B"
    ],
    "spotifyAlbumId": "3qr4pTBWEU1SVf01j6RAx3"
  },
  {
    "id": 91,
    "rank": 91,
    "title": "Demon Days",
    "artist": "Gorillaz",
    "year": 2005,
    "genre": "Alternative Rock, Hip-Hop",
    "coverImage": "/images/albums/demon_days_gorillaz.jpg",
    "description": "923",
    "youtubePlaylistId": "OLAK5uy_n6OIG6WH-BVE-xbdyDfjQeydPbN6l9tF4",
    "displayGenre": "Alternative Rock, Hip-Hop",
    "categories": [
      "Rock",
      "Alternative"
    ],
    "spotifyAlbumId": "0bUTHlWbkSQysoM3VsWldT"
  },
  {
    "id": 92,
    "rank": 92,
    "title": "Brothers",
    "artist": "The Black Keys",
    "year": 2010,
    "genre": "Blues Rock, Rock",
    "coverImage": "/images/albums/brothers_the_black_keys.jpg",
    "description": "10485",
    "youtubePlaylistId": "OLAK5uy_kPaI45m75MNBWljD7pRf8BH_bZQ9aLj4I",
    "displayGenre": "Blues Rock, Rock",
    "categories": [
      "Rock"
    ],
    "spotifyAlbumId": "7qE6RXYyz5kj5Tll7mJU0v"
  },
  {
    "id": 93,
    "rank": 93,
    "title": "Wish You Were Here",
    "artist": "Pink Floyd",
    "year": 1975,
    "genre": "Progressive Rock, Rock",
    "coverImage": "/images/albums/wish_you_were_here_pink_floyd.jpg",
    "description": "358",
    "youtubePlaylistId": "OLAK5uy_mzowhqljIOba8BVGEmVkeaWeL2S_bO4bw",
    "displayGenre": "Progressive Rock, Rock",
    "categories": [
      "Rock"
    ],
    "spotifyAlbumId": "0bCAjiUamIFqKJsekOYuRw"
  },
  {
    "id": 94,
    "rank": 94,
    "title": "Grey Area",
    "artist": "Little Simz",
    "year": 2019,
    "genre": "Hip-Hop",
    "coverImage": "/images/albums/grey_area_little_simz.jpg",
    "description": "149971",
    "youtubePlaylistId": "OLAK5uy_nYrrSOgrF8B09gr-KqNMJGBWQ7i2g7Vjk",
    "displayGenre": "Hip-Hop",
    "categories": [
      "Hip-Hop"
    ],
    "spotifyAlbumId": "3Z8Df4ghTJ7afEWkurB2I1"
  },
  {
    "id": 95,
    "rank": 95,
    "title": "The Crane Wife",
    "artist": "The Decemberists",
    "year": 2006,
    "genre": "Indie Rock, Alternative",
    "coverImage": "/images/albums/the_crane_wife_the_decemberists.jpg",
    "description": "2123",
    "youtubePlaylistId": "OLAK5uy_kmREl6EU_i7w1yyiuN-BJ2ubrTN70Wb6Y",
    "displayGenre": "Indie Rock, Alternative",
    "categories": [
      "Rock",
      "Alternative"
    ],
    "spotifyAlbumId": "4qvFBtRrwbSgoH3nyVlTCp"
  },
  {
    "id": 96,
    "rank": 96,
    "title": "3rd Eye Vision",
    "artist": "Hieroglyphics",
    "year": 1998,
    "genre": "Hip-Hop",
    "coverImage": "/images/albums/3rd_eye_vision_hieroglyphics.jpg",
    "description": "31012",
    "youtubePlaylistId": "OLAK5uy_nNJ0TuexrUtaqxI9PURgmJ16Bay7VTAX4",
    "displayGenre": "Hip-Hop",
    "categories": [
      "Hip-Hop"
    ],
    "spotifyAlbumId": "0NzbSqyQ70uJyPRep1Yg6L"
  },
  {
    "id": 97,
    "rank": 97,
    "title": "The Doors",
    "artist": "The Doors",
    "year": 1967,
    "genre": "Psychedelic Rock, Rock",
    "coverImage": "/images/albums/the_doors_the_doors.jpg",
    "description": "86",
    "youtubePlaylistId": "OLAK5uy_mx98OhRuCf1iPS49rGdS-PxBTvjXdlU6I",
    "displayGenre": "Psychedelic Rock, Rock",
    "categories": [
      "Rock"
    ],
    "spotifyAlbumId": "1jWmEhn3ggaL6isoyLfwBn"
  },
  {
    "id": 98,
    "rank": 98,
    "title": "London Calling",
    "artist": "The Clash",
    "year": 1979,
    "genre": "Punk Rock, Rock",
    "coverImage": "/images/albums/london_calling_the_clash.jpg",
    "description": "65",
    "youtubePlaylistId": "OLAK5uy_nY4cg7X3mkJovrJebYc8GlS82gAcjsX_U",
    "displayGenre": "Punk Rock, Rock",
    "categories": [
      "Rock"
    ],
    "spotifyAlbumId": "6FCzvataOZh68j8OKzOt9a"
  },
  {
    "id": 99,
    "rank": 99,
    "title": "Ugly Is Beautiful",
    "artist": "Oliver Tree",
    "year": 2020,
    "genre": "Alternative Rock, Rock",
    "coverImage": "/images/albums/ugly_is_beautiful_oliver_tree.jpg",
    "description": "174061",
    "youtubePlaylistId": "OLAK5uy_mTGb-5jZfvyyvCbXFmfb4QChFJfFxs8ac",
    "displayGenre": "Alternative Rock, Rock",
    "categories": [
      "Rock",
      "Alternative"
    ],
    "spotifyAlbumId": "1HmWQo43Gt8BR2dylfv3o4"
  },
  {
    "id": 100,
    "rank": 100,
    "title": "Exodus",
    "artist": "Bob Marley & The Wailers",
    "year": 1977,
    "genre": "Reggae",
    "coverImage": "/images/albums/exodus_bob_marley___the_wailers.jpg",
    "description": "49",
    "youtubePlaylistId": "OLAK5uy_kNk8OLihZXKhFewRNxShu6Jq5h2UZ4cmg",
    "displayGenre": "Reggae",
    "categories": [
      "Reggae"
    ],
    "spotifyAlbumId": "655KljKIXl42fiNDMKivbY"
  }
]

const FavoriteAlbums: React.FC = () => {
  const [expandedAlbum, setExpandedAlbum] = React.useState<number | null>(null)
  const [selectedGenre, setSelectedGenre] = React.useState<string>('All')
  const [selectedDecade, setSelectedDecade] = React.useState<string>('All')
  const [sortBy, setSortBy] = React.useState<'rank' | 'year' | 'title' | 'artist'>('rank')

  // Get unique genres and decades
  const genres = ['All', ...Array.from(new Set(favoriteAlbums.map(album => album.genre).filter(genre => genre !== 'Unknown')))]
  const decades = ['All', ...Array.from(new Set(favoriteAlbums.map(album => Math.floor(album.year / 10) * 10).sort()))]

  // Filter and sort albums
  const filteredAlbums = favoriteAlbums
    .filter(album => {
      const genreMatch = selectedGenre === 'All' || album.genre === selectedGenre
      const decadeMatch = selectedDecade === 'All' || Math.floor(album.year / 10) * 10 === parseInt(selectedDecade)
      return genreMatch && decadeMatch
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'year':
          return a.year - b.year
        case 'title':
          return a.title.localeCompare(b.title)
        case 'artist':
          return a.artist.localeCompare(b.artist)
        default:
          return a.rank - b.rank
      }
    })

  return (
    <div className="favorite-albums-page">
      <div className="container">
        <h1 className="page-title">Top Albums</h1>
        <p className="page-description">My personal collection of favorite albums</p>
        
        {/* Filter and Sort Controls */}
        <div className="filter-controls">
          <div className="filter-group">
            <label>Genre:</label>
            <select 
              value={selectedGenre} 
              onChange={(e) => setSelectedGenre(e.target.value)}
              className="filter-select"
            >
              {genres.map(genre => (
                <option key={genre} value={genre}>{genre}</option>
              ))}
            </select>
          </div>
          
          <div className="filter-group">
            <label>Decade:</label>
            <select 
              value={selectedDecade} 
              onChange={(e) => setSelectedDecade(e.target.value)}
              className="filter-select"
            >
              {decades.map(decade => (
                <option key={decade} value={decade}>{decade}</option>
              ))}
            </select>
          </div>
          
          <div className="filter-group">
            <label>Sort by:</label>
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value as 'rank' | 'year' | 'title' | 'artist')}
              className="filter-select"
            >
              <option value="rank">Rank</option>
              <option value="year">Year</option>
              <option value="title">Title</option>
              <option value="artist">Artist</option>
            </select>
          </div>
          
          <div className="filter-stats">
            Showing {filteredAlbums.length} of {favoriteAlbums.length} albums
          </div>
        </div>
        
        <div className="albums-list">
          {filteredAlbums.map((album) => {
            const isExpanded = expandedAlbum === album.id
            const isLastInRow = album.rank % 5 === 0
            const isSecondToLastInRow = album.rank % 5 === 4
            
            return (
              <div 
                key={album.id} 
                className={`album-item ${isExpanded ? 'expanded' : ''} ${isExpanded ? (isLastInRow || isSecondToLastInRow ? 'expand-left' : 'expand-right') : ''}`}
                onClick={() => setExpandedAlbum(isExpanded ? null : album.id)}
              >
                <div className="album-rank">#{album.rank}</div>
                
                <div className="album-cover">
                  <img 
                    src={album.coverImage} 
                    alt={`${album.title} by ${album.artist}`}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      target.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                  <div className="album-cover-placeholder hidden">
                    <div className="placeholder-icon">🎵</div>
                    <div className="placeholder-text">No Cover</div>
                  </div>
                </div>
                
                <div className="album-info">
                  <h3 className="album-title">{album.title}</h3>
                  <p className="album-artist">{album.artist}</p>
                  <p className="album-year">{album.year}</p>
                  <p className="album-genre">{album.displayGenre}</p>
                  
                  {/* Expanded content */}
                  {isExpanded && (
                    <div className="album-expanded-content">

                      
                      {album.favoriteTracks && album.favoriteTracks.length > 0 && (
                        <div className="favorite-tracks">
                          <h4>Favorite Tracks</h4>
                          <ul>
                            {album.favoriteTracks.map((track, index) => (
                              <li key={index}>{track}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      <div className="music-embed">
                        <h4>Listen to Album</h4>
                        {album.youtubeMusicId ? (
                          <div className="youtube-player">
                            <iframe
                              style={{ borderRadius: '12px' }}
                              src={`https://www.youtube.com/embed/${album.youtubeMusicId}?autoplay=0&modestbranding=1&rel=0`}
                              width="100%"
                              height="315"
                              frameBorder="0"
                              allowFullScreen
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              loading="lazy"
                            ></iframe>
                          </div>
                        ) : album.youtubePlaylistId && album.youtubePlaylistId !== "" ? (
                          <div className="youtube-player">
                            <iframe
                              style={{ borderRadius: '12px' }}
                              src={`https://www.youtube.com/embed/videoseries?list=${album.youtubePlaylistId}&autoplay=0`}
                              width="100%"
                              height="315"
                              frameBorder="0"
                              allowFullScreen
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              loading="lazy"
                            ></iframe>
                          </div>
                        ) : album.spotifyAlbumId ? (
                          <div className="spotify-player">
                            <iframe
                              style={{ borderRadius: '12px' }}
                              src={`https://open.spotify.com/embed/album/${album.spotifyAlbumId}`}
                              width="100%"
                              height="352"
                              frameBorder="0"
                              allowFullScreen
                              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                              loading="lazy"
                            ></iframe>
                          </div>
                        ) : (
                          <div className="music-placeholder">
                            <p>No music player available</p>
                            <p className="music-help">Add YouTube Music or Spotify album ID to enable playback</p>
                          </div>
                        )}
                      </div>
                      
                      <div className="album-actions">
                        {album.spotifyAlbumId && (
                          <button 
                            className="spotify-btn"
                            onClick={(e) => {
                              e.stopPropagation()
                              // Create a hidden link element to trigger the app protocol
                              const link = document.createElement('a')
                              link.href = `spotify:album:${album.spotifyAlbumId}`
                              link.style.display = 'none'
                              document.body.appendChild(link)
                              link.click()
                              document.body.removeChild(link)
                              
                              // Fallback to web version after a delay
                              setTimeout(() => {
                                window.open(`https://open.spotify.com/album/${album.spotifyAlbumId}`, '_blank')
                              }, 500)
                            }}
                          >
                            <span>♫</span> Open in Spotify
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
        
        <div className="add-album-section">
          <h2>Add New Album</h2>
          <p>Want to add more albums to this list? You can edit the data in the component file.</p>
        </div>
      </div>
    </div>
  )
}

export default FavoriteAlbums