import React from "react";
import DateTimeField from "../../../common/DateTimeField/DateTimeField";

//перепроверить
//лучше переделать как-то
export const SelectionInput = ({
   value,
   onChange,
   onStartTimeChange,
   onEndTimeChange,
   error,
   required = false,
}) => (
   <div className="form-col">
      <DateTimeField
         value={value}
         onChange={onChange}
         //  onChange={(date) => {
         //                 setValue("date", date, { shouldValidate: true });
         //              }}
         onStartTimeChange={onStartTimeChange}
         //  onStartTimeChange={(time) => {
         //                 setValue("startTime", time, { shouldValidate: true });
         //              }}
         onEndTimeChange={onEndTimeChange}
         //  onEndTimeChange={(time) => {
         //                 setValue("endTime", time, { shouldValidate: true });
         //              }}
         errors={error}
         //  errors={{
         //     date: errors.date?.message,
         //     startTime: errors.startTime?.message,
         //     endTime: errors.endTime?.message,
         //  }}
      />
   </div>
);
