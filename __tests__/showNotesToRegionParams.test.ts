import { extractTimestampsFromShowNotes } from "@/lib/utils/timestampUtils"

const exampleShowNotes =
    '<p>In this supper club episode of Syntax, Wes and Scott talk with Stuart Bloxham about how he learned to code, what his interview process was like when applying for a job, how he found the time to make it all work, and his thoughts on bootcamps and ways to learn.</p><h2>Show Notes</h2><ul><li><a href="#t=00:36" rel="noopener noreferrer" target="_blank"><strong>00:36</strong></a> Welcome</li><li><a href="https://github.com/sbloxy123" rel="noopener noreferrer" target="_blank">Stuart Bloxham on GitHub</a></li><li><a href="https://www.linkedin.com/in/stuart-bloxham-a36197121/?originalSubdomain=uk" rel="noopener noreferrer" target="_blank"> Stuart Bloxham on LinkedIn</a></li><li><a href="#t=02:09" rel="noopener noreferrer" target="_blank"><strong>02:09</strong></a> How did you decide to be a web developer?</li><li><a href="#t=08:22" rel="noopener noreferrer" target="_blank"><strong>08:22</strong></a> Did you have clarity when your kid was born?</li><li><a href="#t=10:20" rel="noopener noreferrer" target="_blank"><strong>10:20</strong></a> What was the interview process like?</li><li><a href="#t=18:25" rel="noopener noreferrer" target="_blank"><strong>18:25</strong></a> What and how did you learn?</li><li><a href="#t=20:28" rel="noopener noreferrer" target="_blank"><strong>20:28</strong></a> What’s the state of bootcamps in 2023?</li><li><a href="#t=22:03" rel="noopener noreferrer" target="_blank"><strong>22:03</strong></a> How important have soft skills been?</li><li><a href="#t=25:14" rel="noopener noreferrer" target="_blank"><strong>25:14</strong></a> How do you know when you’re ready to apply for a job?</li><li><a href="#t=35:24" rel="noopener noreferrer" target="_blank"><strong>35:24</strong></a> Do you like coding?</li><li><a href="#t=37:49" rel="noopener noreferrer" target="_blank"><strong>37:49</strong></a> How did you find the time to make it all work?</li><li><a href="#t=41:42" rel="noopener noreferrer" target="_blank"><strong>41:42</strong></a> How did you deal with burnout?</li><li><a href="#t=43:06" rel="noopener noreferrer" target="_blank"><strong>43:06</strong></a> Supper Club questions</li><li><a href="#t=45:34" rel="noopener noreferrer" target="_blank"><strong>45:34</strong></a> SIIIIICK ××× PIIIICKS ×××</li></ul><h2>××× SIIIIICK ××× PIIIICKS ×××</h2><ul><li><a href="https://en.wikipedia.org/wiki/Flowerhorn_cichlid" rel="noopener noreferrer" target="_blank">Flowerhorn cichlid</a></li></ul><h2>Shameless Plugs</h2><ul><li><a href="https://www.stuartbloxham.tech/" rel="noopener noreferrer" target="_blank">Stuart Bloxham’s Portfolio</a></li></ul><h2>Tweet us your tasty treats</h2><ul><li><a href="https://www.instagram.com/stolinski/" rel="noopener noreferrer" target="_blank">Scott’s Instagram</a></li><li><a href="https://www.instagram.com/LevelUpTutorials/" rel="noopener noreferrer" target="_blank">LevelUpTutorials Instagram</a></li><li><a href="https://www.instagram.com/wesbos/" rel="noopener noreferrer" target="_blank">Wes’ Instagram</a></li><li><a href="https://twitter.com/wesbos" rel="noopener noreferrer" target="_blank">Wes’ Twitter</a></li><li><a href="https://www.facebook.com/wesbos.developer" rel="noopener noreferrer" target="_blank">Wes’ Facebook</a></li><li><a href="https://twitter.com/stolinski" rel="noopener noreferrer" target="_blank">Scott’s Twitter</a></li><li>Make sure to include <a href="https://twitter.com/SyntaxFM" rel="noopener noreferrer" target="_blank">@SyntaxFM</a> in your tweets</li><li><a href="https://bsky.app/profile/wesbos.com" rel="noopener noreferrer" target="_blank">Wes Bos on Bluesky</a></li><li><a href="https://bsky.app/profile/tolin.ski" rel="noopener noreferrer" target="_blank">Scott on Bluesky</a></li><li><a href="https://bsky.app/profile/syntax.fm" rel="noopener noreferrer" target="_blank">Syntax on Bluesky</a></li></ul>'
describe("showNotesToRegionParams", () => {
    it("should return an array of region params", () => {
        // Now, hrefArray contains the href values of all <a> tags
        const regions = extractTimestampsFromShowNotes(exampleShowNotes)
        expect(regions.length).toBeGreaterThan(0)
    })
})

//extracted timestamps should be put inside li tags