import React from "react";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { Box, Card, CardContent, makeStyles, Typography } from "@material-ui/core";

import Icons from "../../constants/icons";
import { Avatar, Button, Status } from "../index";

const useStyles = makeStyles({
  image: {
    "&:hover": {
      zIndex: 1,
      transition: "240ms"
    }
  }
});

export const ProductInfo = ({ product: c, actions }) => {
  const classes = useStyles();

  return (
    <Card key={c._id}>
      <CardContent>
        <Box display="flex">
          {c.images.slice(0, 2).map((i, idx) => (
            <Avatar
              key={"image" + idx}
              className={classes.image}
              size={124}
              text={c.name}
              src={i.image?.thumbnail}
              variant="rounded"
              style={{ margin: -8, marginLeft: idx ? -104 : -8 }}
            />
          ))}
          <Box flexGrow={1} ml={2}>
            <Box display="flex" justifyContent="space-between">
              <Status status={c.status || "Active"} />

              <Typography variant="caption" color="textSecondary">
                Created by {c.createdBy || "anonymous"} @ {format(new Date(c.createdAt), "MMM do, yyyy")}
              </Typography>
            </Box>

            <Box display="flex" justifyContent="space-between" alignItems="flex-end">
              <Box>
                <Box display="flex" alignItems="flex-end" mt={1}>
                  <Typography variant="h5">{c.name}</Typography>
                  <Box ml={3}>
                    <Typography variant="subtitle1">{c.productCode}</Typography>
                  </Box>
                </Box>

                <Box display="flex" alignItems="center">
                  {[c.category?.name, c.subcategory?.name, c.subSubcategory?.name]
                    .filter(Boolean)
                    .join(" > ")}
                </Box>
                <Typography variant="body1">{c.supplier?.name}</Typography>
              </Box>

              <Box display="flex">
                {actions}
                <Button component={Link} to={`/products/` + c._id} icon={Icons.send} />
              </Box>
            </Box>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};
