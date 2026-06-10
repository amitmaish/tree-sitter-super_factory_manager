/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

/**
 * @file A Minecraft mod that adds a domain-specific language for logistics automation.
 *
 * @license MIT
 * @param {String} str
 */

export default grammar({
  name: "super_factory_manager",

  extras: ($) => [/\s/, $.LINE_COMMENT],

  rules: {
    program: ($) => seq(optional($.name), repeat($.trigger)),

    name: ($) => seq($.NAME, $.string),

    //
    // TRIGGERS
    //

    trigger: ($) =>
      choice(
        seq($.EVERY, $.interval, $.DO, $.block, $.END),
        seq($.EVERY, $.REDSTONE, $.PULSE, $.DO, $.block, $.END),
      ),

    interval: ($) =>
      choice(
        seq(
          optional($.NUMBER),
          optional($.GLOBAL),
          optional(seq($.PLUS, $.NUMBER)),
          choice($.TICKS, $.TICK, $.SECONDS, $.SECOND),
        ),
        seq(
          $.NUMBER_WITH_G_SUFFIX,
          optional(seq($.PLUS, $.NUMBER)),
          choice($.TICKS, $.TICK, $.SECONDS, $.SECOND),
        ),
      ),

    //
    // BLOCK STATEMENT
    //

    block: ($) => repeat1($.statement),
    statement: ($) =>
      choice(
        $.inputStatement,
        $.outputStatement,
        $.ifStatement,
        $.forgetStatement,
      ),

    // IO STATEMENT
    forgetStatement: ($) =>
      prec.left(
        seq(
          $.FORGET,
          optional($.label),
          repeat(seq($.COMMA, $.label)),
          optional($.COMMA),
        ),
      ),
    inputStatement: ($) =>
      prec.right(
        choice(
          seq(
            $.INPUT,
            optional($.inputResourceLimits),
            optional($.resourceExclusion),
            $.FROM,
            optional($.EACH),
            $.labelAccess,
          ),
          seq(
            $.FROM,
            optional($.EACH),
            $.labelAccess,
            $.INPUT,
            optional($.inputResourceLimits),
            optional($.resourceExclusion),
          ),
        ),
      ),
    outputStatement: ($) =>
      prec.left(
        choice(
          seq(
            $.OUTPUT,
            optional($.outputResourceLimits),
            optional($.resourceExclusion),
            $.TO,
            optional($.emptyslots),
            optional($.EACH),
            $.labelAccess,
          ),
          seq(
            $.TO,
            optional($.emptyslots),
            optional($.EACH),
            $.labelAccess,
            $.OUTPUT,
            optional($.outputResourceLimits),
            optional($.resourceExclusion),
          ),
        ),
      ),

    inputResourceLimits: ($) => $.resourceLimitList,
    outputResourceLimits: ($) => $.resourceLimitList,

    resourceLimitList: ($) =>
      prec.left(
        seq(
          $.resourceLimit,
          repeat(seq($.COMMA, $.resourceLimit)),
          optional($.COMMA),
        ),
      ),
    resourceLimit: ($) =>
      prec.left(
        choice(
          seq(optional($.limit), $.resourceIdDisjunction, optional($.with)),
          seq($.limit, optional($.with)),
          $.with,
        ),
      ),
    limit: ($) =>
      prec.left(choice(seq($.quantity, $.retention), $.retention, $.quantity)),

    quantity: ($) => prec.left(seq($.number, optional($.EACH))),
    retention: ($) => prec.left(seq($.RETAIN, $.number, optional($.EACH))),

    resourceExclusion: ($) => seq($.EXCEPT, $.resourceIdList),

    resourceId: ($) =>
      prec.left(
        choice(
          seq(
            $.identifier,
            optional(
              seq(
                $.COLON,
                optional($.identifier),
                optional(
                  seq(
                    $.COLON,
                    optional($.identifier),
                    optional(seq($.COLON, optional($.identifier))),
                  ),
                ),
              ),
            ),
          ),
          $.string,
        ),
      ),

    resourceIdList: ($) =>
      prec.left(
        seq(
          $.resourceId,
          repeat(seq($.COMMA, $.resourceId)),
          optional($.COMMA),
        ),
      ),
    resourceIdDisjunction: ($) =>
      prec.left(
        seq($.resourceId, repeat(seq($.OR, $.resourceId)), optional($.OR)),
      ),

    with: ($) =>
      prec.left(
        choice(seq($.WITH, $.withClause), seq($.WITHOUT, $.withClause)),
      ),
    withClause: ($) =>
      prec.left(
        choice(
          seq($.LPAREN, $.withClause, $.RPAREN),
          seq($.NOT, $.withClause),
          seq($.withClause, $.AND, $.withClause),
          seq($.withClause, $.OR, $.withClause),
          seq(choice(seq($.TAG, optional($.HASHTAG)), $.HASHTAG), $.tagMatcher),
        ),
      ),

    tagMatcher: ($) =>
      choice(
        seq(
          $.identifier,
          $.COLON,
          $.identifier,
          repeat(seq($.SLASH, $.identifier)),
        ),
        seq($.identifier, repeat(seq($.SLASH, $.identifier))),
      ),

    sidequalifier: ($) =>
      choice(
        seq($.EACH, $.SIDE),
        seq($.side, repeat(seq($.COMMA, $.side)), $.SIDE),
      ),

    side: ($) =>
      choice(
        $.TOP,
        $.BOTTOM,
        $.NORTH,
        $.EAST,
        $.SOUTH,
        $.WEST,
        $.LEFT,
        $.RIGHT,
        $.FRONT,
        $.BACK,
        $.NULL,
      ),

    slotqualifier: ($) => seq(choice($.SLOTS, $.SLOT), $.rangeset),
    rangeset: ($) => seq($.range, repeat(seq($.COMMA, $.range))),
    range: ($) => seq($.number, optional(seq($.DASH, $.number))),

    ifStatement: ($) =>
      seq(
        $.IF,
        $.boolexpr,
        $.THEN,
        $.block,
        repeat(seq($.ELSE, $.IF, $.boolexpr, $.THEN, $.BLOCK)),
        optional(seq($.ELSE, $.BLOCK)),
        $.END,
      ),
    boolexpr: ($) =>
      prec.left(
        choice(
          $.TRUE,
          $.FALSE,
          seq($.LPAREN, $.boolexpr, $.RPAREN),
          seq($.NOT, $.boolexpr),
          seq($.boolexpr, $.AND, $.boolexpr),
          seq($.boolexpr, $.OR, $.boolexpr),
          seq(
            optional($.setOp),
            $.labelAccess,
            $.HAS,
            $.comparisonOp,
            $.number,
            optional($.resourceIdDisjunction),
            optional($.with),
            optional(seq($.EXCEPT, $.resourceIdList)),
          ),
          seq($.REDSTONE, optional(seq($.comparisonOp, $.number))),
        ),
      ),

    comparisonOp: ($) =>
      choice(
        $.GT,
        $.LT,
        $.EQ,
        $.LE,
        $.GE,
        $.GT_SYMBOL,
        $.LT_SYMBOL,
        $.EQ_SYMBOL,
        $.LE_SYMBOL,
        $.GE_SYMBOL,
      ),

    setOp: ($) => choice($.OVERALL, $.SOME, $.EVERY, $.EACH, $.ONE, $.LONE),

    //
    // IO HELPERS
    //
    labelAccess: ($) =>
      prec.left(
        seq(
          $.label,
          repeat(seq($.COMMA, $.label)),
          optional($.roundrobin),
          optional($.sidequalifier),
          optional($.slotqualifier),
        ),
      ),
    roundrobin: ($) => seq($.ROUND, $.ROBIN, $.BY, choice($.LABEL, $.BLOCK)),

    // TODO: '#' the og SFML code. what do they do? seem like TreeSitter captures
    label: ($) => choice($.identifier, $.string),

    emptyslots: ($) => seq($.EMPTY, choice($.SLOT, $.SLOTS), $.IN),

    identifier: ($) =>
      prec.left(
        choice(
          $.IDENTIFIER,
          $.REDSTONE,
          $.GLOBAL,
          $.SECOND,
          $.SECONDS,
          $.TOP,
          $.BOTTOM,
          $.LEFT,
          $.RIGHT,
          $.FRONT,
          $.BACK,
        ),
      ),

    // GENERAL
    string: ($) => $.STRING,
    number: ($) => $.NUMBER,

    //
    // LEXER
    //

    // IF STATEMENT
    IF: (_$) => new RustRegex("(?i)if"),
    THEN: (_$) => new RustRegex("(?i)then"),
    ELSE: (_$) => new RustRegex("(?i)else"),

    HAS: (_$) => new RustRegex("(?i)has"),
    OVERALL: (_$) => new RustRegex("(?i)overall"),
    SOME: (_$) => new RustRegex("(?i)some"),
    ONE: (_$) => new RustRegex("(?i)one"),
    LONE: (_$) => new RustRegex("(?i)lone"),

    // BOOLEAN LOGIC
    TRUE: (_$) => new RustRegex("(?i)true"),
    FALSE: (_$) => new RustRegex("(?i)false"),
    NOT: (_$) => new RustRegex("(?i)not"),
    AND: (_$) => new RustRegex("(?i)and"),
    OR: (_$) => new RustRegex("(?i)or"),

    // QUANTITY LOGIC
    GT: (_$) => new RustRegex("(?i)gt"),
    GT_SYMBOL: (_$) => ">",
    LT: (_$) => new RustRegex("(?i)lt"),
    LT_SYMBOL: (_$) => "<",
    EQ: (_$) => new RustRegex("(?i)eq"),
    EQ_SYMBOL: (_$) => "=",
    LE: (_$) => new RustRegex("(?i)le"),
    LE_SYMBOL: (_$) => "<=",
    GE: (_$) => new RustRegex("(?i)ge"),
    GE_SYMBOL: (_$) => ">=",

    // IO LOGIC
    FROM: (_$) => new RustRegex("(?i)from"),
    TO: (_$) => new RustRegex("(?i)to"),
    INPUT: (_$) => new RustRegex("(?i)input"),
    OUTPUT: (_$) => new RustRegex("(?i)output"),
    WHERE: (_$) => new RustRegex("(?i)where"),
    SLOTS: (_$) => new RustRegex("(?i)slots"),
    SLOT: (_$) => new RustRegex("(?i)slot"),
    RETAIN: (_$) => new RustRegex("(?i)retain"),
    EACH: (_$) => new RustRegex("(?i)each"),
    EXCEPT: (_$) => new RustRegex("(?i)except"),
    FORGET: (_$) => new RustRegex("(?i)forget"),
    EMPTY: (_$) => new RustRegex("(?i)empty"),
    IN: (_$) => new RustRegex("(?i)in"),

    // WITH LOGIC
    WITHOUT: (_$) => new RustRegex("(?i)without"),
    WITH: (_$) => new RustRegex("(?i)with"),
    TAG: (_$) => new RustRegex("(?i)tag"),
    HASHTAG: (_$) => "#",

    // ROUND ROBIN
    ROUND: (_$) => new RustRegex("(?i)round"),
    ROBIN: (_$) => new RustRegex("(?i)robin"),
    BY: (_$) => new RustRegex("(?i)by"),
    LABEL: (_$) => new RustRegex("(?i)label"),
    BLOCK: (_$) => new RustRegex("(?i)block"),

    // SIDE LOGIC
    TOP: (_$) => new RustRegex("(?i)top"),
    BOTTOM: (_$) => new RustRegex("(?i)bottom"),
    NORTH: (_$) => new RustRegex("(?i)north"),
    EAST: (_$) => new RustRegex("(?i)east"),
    SOUTH: (_$) => new RustRegex("(?i)south"),
    WEST: (_$) => new RustRegex("(?i)west"),
    SIDE: (_$) => new RustRegex("(?i)side"),
    LEFT: (_$) => new RustRegex("(?i)left"),
    RIGHT: (_$) => new RustRegex("(?i)right"),
    FRONT: (_$) => new RustRegex("(?i)front"),
    BACK: (_$) => new RustRegex("(?i)back"),
    NULL: (_$) => new RustRegex("(?i)null"),

    // TIMER TRIGGERS
    TICKS: (_$) => new RustRegex("(?i)ticks"),
    TICK: (_$) => new RustRegex("(?i)tick"),
    SECONDS: (_$) => new RustRegex("(?i)seconds"),
    SECOND: (_$) => new RustRegex("(?i)second"),
    GLOBAL: (_$) => new RustRegex("(?i)global|(?i)g"),
    PLUS: (_$) => new RustRegex("[+]|(?i)plus"),

    // REDSTONE TRIGGERS
    REDSTONE: (_$) => new RustRegex("(?i)redstone"),
    PULSE: (_$) => new RustRegex("(?i)pulse"),

    // PROGRAM SYMBOLS
    DO: (_$) => new RustRegex("(?i)do"),
    END: (_$) => new RustRegex("(?i)end"),
    NAME: (_$) => new RustRegex("(?i)name"),

    // GENERAL SYMBOLS
    // used by triggers and as a set operator
    EVERY: (_$) => new RustRegex("(?i)every"),

    COMMA: (_$) => ",",
    COLON: (_$) => ":",
    SLASH: (_$) => "/",
    DASH: (_$) => "-",
    LPAREN: (_$) => "(",
    RPAREN: (_$) => ")",

    NUMBER_WITH_G_SUFFIX: (_$) => new RustRegex("[0-9_]+(?i)g"),
    NUMBER: (_$) => new RustRegex("[0-9_]+"),
    IDENTIFIER: (_$) => new RustRegex("[a-zA-Z_*][a-zA-Z0-9_*]*|[*]"),

    STRING: (_$) => new RustRegex('"[^"]*"'),

    LINE_COMMENT: (_$) => new RustRegex("-- [^\r\n]*"),

    WS: (_$) => new RustRegex("(\r\n)*"),
  },
});
