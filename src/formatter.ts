import Formats from "./Model/Formats";

const convertStringToDate = (value: string) => {
  const year: number = Number.parseInt(value.slice(0, 4));
  const month: number = Number.parseInt(value.slice(4, 6));
  const date: number = Number.parseInt(value.slice(6, 8));
  return new Date(year, month, date);
};

const formatters = [
  {
    Text: "None",
    Converter: value => value
  },
  {
    Text: "Upper Case",
    Converter: value => value.toUpperCase()
  },
  {
    Text: "Lower Case",
    Converter: value => value.toLowerCase()
  },
  {
    Text: "Title Case",
    Converter: value => {
      let rtn = "";
      const words = value.split(" ");
      for (let i = 0; i < words.length; i++) {
        rtn +=
          words[i].slice(0, 1).toUpperCase() +
          words[i].slice(1, words[i].length).toLowerCase() +
          " ";
      }
      return rtn;
    }
  },
  {
    Text: "Date (-)",
    Converter: value => {
      const date = convertStringToDate(value);
      return date.getFullYear() + "-" + date.getMonth() + "-" + date.getDate();
    }
  },
  {
    Text: "Date (/)",
    Converter: value => {
      const date = convertStringToDate(value);
      return date.getDate() + "/" + date.getMonth() + "/" + date.getFullYear();
    }
  },
  {
    Text: "Date (Pretty)",
    Converter: value => {
      const date = convertStringToDate(value);
      const suffices = ["th", "st", "nd", "rd"];
      const currentDate = date.getDate();
      const currentDateString = currentDate.toString();
      const lastDayDigit = Number.parseInt(
        currentDateString[currentDateString.length - 1]
      );

      let suffix = suffices[0];
      if (lastDayDigit > 0 && lastDayDigit < 4) {
        suffix = suffices[lastDayDigit];
      }

      const months = [
        "January",
        "Feburary",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December"
      ];

      return currentDate + suffix + " " + months[date.getMonth()] + " " + date.getFullYear();
    }
  },
  {
    Text: "Bank Account",
    Converter: value => {
      let rtn = "";
      for (let i: number = 0; i < value.length - 4; i++) {
        rtn += "*";
      }
      rtn += value.substring(value.length - 4);
      return rtn;
    }
  },
  {
    Text: "Sort Code",
    Converter: value => {
      if (value.length != 8) {
        return value;
      }

      return "**-**-" + value.substring(6);
    }
  }
] as Formats[];

export const setupSelectTemplate = (select: HTMLSelectElement) => {
  for (let i = 0; i < formatters.length; i++) {
    const option = document.createElement("option");
    option.innerHTML = formatters[i].Text;
    select.appendChild(option);
  }
};

export const formatData = (value: string, type: number) => {
  if (type < 0 || type >= formatters.length) return value;

  return formatters[type].Converter(value);
};

export default formatters;
