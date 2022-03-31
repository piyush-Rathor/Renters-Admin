import { Box, Card, CardContent } from "@material-ui/core";
import React from "react";
import cloneDeep from "lodash/cloneDeep";
import { ContentCell } from "../index";
import Icons from "../../constants/icons";
import { FormDialog } from "../Form";
import addBank from "../../constants/forms/add-bank";
import { updateResellerBank, updateSupplierBank } from "../../services/api";
import { toast } from "react-toastify";

const addBankForm = cloneDeep(addBank);
const BankDetails = ({ _id, beneficiaryName, iban, bankName, bankId, entity = "resellers" }) => {

  const _updateBankDetails = async (_id, val) => {
    try {
      delete val.entityId;
      let bank = "";
      if (entity === "resellers")
        bank = await updateResellerBank(_id, bankId, val);
      else
        bank = await updateSupplierBank(_id, bankId, val);
      if (!bank)
        throw new Error("Bank cannot be created, try again");
      toast.success("Bank added successfully");
    } catch (e) {
      toast.error(e.message);
    } finally {
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  };

  return <Card>
    <CardContent>
      <Box display="flex">
        <Box flexGrow={1} ml={2}>
          <Box display="flex" justifyContent="space-between">
            <ContentCell
              label="Beneficiary Name"
              content={beneficiaryName}
            />
          </Box>
          <Box>
            <ContentCell
              label="Receiver IBAN"
              content={iban}
            />
          </Box>
          <Box>
            <ContentCell
              label="Receiver Bank Name"
              content={bankName}
            />
          </Box>
        </Box>
        <Box display="flex">
          <FormDialog
            title="Update Bank Details"
            buttonProps={{ icon: Icons.edit }}
            formProps={{
              formConfig: addBankForm,
              submitHandler: val => _updateBankDetails(_id, val),
              incomingValue: { entityId: _id, bankName, iban, beneficiaryName }
            }}
          />
        </Box>
      </Box>
    </CardContent>
  </Card>;
};

export default BankDetails;
