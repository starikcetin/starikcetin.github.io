const { hasValue } = require('./nullish');
const customSlugify = require('./custom-slugify');

const defaultSlugifyOptions = {
    stack: true,
};

class UniqueSlugifier {
    constructor(slugifyOptions = {}) {        
        this.slugifyOptions = { ...defaultSlugifyOptions, ...slugifyOptions };
        this.counters = {};
        this.slugStack = [];
    }

    perpendStack(level, slug) {
        while(this.slugStack.length !== 0 && this.slugStack[this.slugStack.length - 1].level >= level) {
            this.slugStack.pop();
        }

        this.slugStack.push({ level, slug });

        return this.slugStack.map(x => x.slug).join('/');
    }

    uniquify(slug) {
        if (hasValue(this.counters[slug])) {
            this.counters[slug] += 1;
            return `${slug}-${this.counters[slug]}`;
        } else {
            this.counters[slug] = 0;
            return slug;
        }
    }

    slugify(level, str, arrayJoiner = "-") {
        let slug;
        if (str instanceof Array) {
            slug = str.map(x => customSlugify(x)).join(arrayJoiner);
        } else {
            slug = customSlugify(str);
        }

        if(this.slugifyOptions.stack) {
            slug = this.perpendStack(level, slug);
        }

        slug = this.uniquify(slug);
        return slug;
    }
}

module.exports = UniqueSlugifier;
