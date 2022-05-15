export interface IAlerts {
    id:           number;
    email:        string;
    price:        number;
    direction:    string;
    message:      string;
    phone_number: string;
    symbol:       string;
    active:       boolean;
}

export interface ISymbols {
    id:          number;
    symbol:      string;
    price:       number;
    digits:      number;
    img_first:   string;
    img_second:  string;
    description: string;
}