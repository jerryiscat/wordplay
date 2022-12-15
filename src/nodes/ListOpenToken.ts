import { LIST_OPEN_SYMBOL } from "../parser/Tokenizer";
import Token from "./Token";
import TokenType from "./TokenType";

export default class ListOpenToken extends Token {

    constructor() {
        super(LIST_OPEN_SYMBOL, TokenType.LIST_OPEN);
    }
    
}