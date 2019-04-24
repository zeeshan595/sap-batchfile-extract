export default interface Formats {
  Text: string;
  Converter: (value: string) => string;
};