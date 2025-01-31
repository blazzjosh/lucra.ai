import type { ExTag } from "$lib/server/db/schema.js";

// export const tagState = $state<ExTag | null>(null);


class TagState {
    tag: any = $state(null);

    setTag(tag: any) {
        this.tag = tag;
    }

    getTag() {
        return this.tag;
    }
}

export const tagState = new TagState();
