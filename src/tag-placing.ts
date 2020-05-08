export type TagIndex = {[tag: string]: true};

export type TagPlacing = {
    overlap?: {
        stop: TagIndex;
        with?: TagIndex;
    };
    parent?: {
        deleteWithoutParent?: TagIndex;
    } & ({
        requireDirectParent: TagIndex;
        defaultDirectParent: string;
    } | {})
};

export const tagPlacings: {[tag: string]: TagPlacing} = {
    li: {
        overlap: {
            stop: {ul: true, ol: true}
        }
    },
    td: {
        overlap: {
            stop: {tr: true},
            with: {th: true}
        },
        parent: {
            deleteWithoutParent: {tr: true}
        }
    },
    th: {
        overlap: {
            stop: {tr: true},
            with: {td: true}
        },
        parent: {
            deleteWithoutParent: {tr: true}
        }
    },
    tr: {
        overlap: {
            stop: {
                table: true
            }
        },
        parent: {
            requireDirectParent: {tbody: true, thead: true, tfoot: true},
            defaultDirectParent: 'tbody',
            deleteWithoutParent: {tbody: true, thead: true, tfoot: true}
        }
    },
    thead: {
        overlap: {
            stop: {table: true},
            with: {tbody: true, tfoot: true}
        },
        parent: {
            deleteWithoutParent: {table: true}
        }
    },
    tbody: {
        overlap: {
            stop: {table: true},
            with: {thead: true, tfoot: true}
        },
        parent: {
            deleteWithoutParent: {table: true}
        }
    },
    tfoot: {
        overlap: {
            stop: {table: true},
            with: {thead: true, tbody: true}
        },
        parent: {
            deleteWithoutParent: {table: true}
        }
    }
};
