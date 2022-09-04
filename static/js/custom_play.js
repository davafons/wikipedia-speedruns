
import { AutocompleteInput } from "./modules/autocomplete.js";
import { PromptGenerator } from "./modules/generator.js"
import { checkArticles } from "/static/js/modules/wikipediaAPI/util.js";

var customPlay = {
    components: {
        'prompt-generator': PromptGenerator,
        'ac-input': AutocompleteInput
    },

    data: function () {
        return {
            start: "", // The input article names
            end: "",

            articleCheckMessage: "",

            scroll: null
        }
	},

    methods: {

        async generateRndPrompt(prompt) {
            [this[prompt]] = await this.$refs.pg.generatePrompt();
        },

        play(start, end) {
            window.location.assign(`/play/quick_play?prompt_start=${start}&prompt_end=${end}${this.scroll ? '&scroll=1' : ''}`);
        },

        async playCustom() {
            this.articleCheckMessage = "";
            const resp = await checkArticles(this.start, this.end);
            if(resp.err) {
                this.articleCheckMessage = resp.err;
                return;
            }

            this.play(resp.body.start, resp.body.end);
        },

        async playRandom() {
            let resp;
            do {
                const [start, end] = await this.$refs.pg.generatePrompt(2);
                console.log("start: " + start + " end: " + end);
                resp = await checkArticles(start, end);
            } while (resp.err);
            
            this.play(resp.body.start, resp.body.end);
        },
	},

    template: (`
        <div>
            <div class="row">
                <div class="col-sm mb-2 mb-sm-0">
                    <div class="input-group flex-nowrap">
                        <ac-input :text.sync="start" placeholder="Start Article"></ac-input>
                    </div>
                </div>
                <div class="col-sm">
                    <div class="input-group flex-nowrap">
                        <ac-input :text.sync="end" placeholder="End Article"></ac-input>
                    </div>
                </div>
                <p v-if="articleCheckMessage" class="text-danger mb-0">{{articleCheckMessage}}</p>
            </div>

            <div class="form-check">
                <label class="form-check-label">
                    <input class="form-check-input" type="checkbox" v-model="scroll">
                    Enable auto-scrolling
                </label>
            </div>

            <div class="gap-2 d-flex justify-content-center justify-content-md-start my-3">
                <button type="button" class="btn quick-play" v-on:click="playCustom">Play Now</button>
            </div>
        </div>
    `)
};

export { customPlay }
