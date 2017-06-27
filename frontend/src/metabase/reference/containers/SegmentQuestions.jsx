/* eslint "react/prop-types": "warn" */
import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import moment from "moment";

import visualizations from "metabase/visualizations";
import { isQueryable } from "metabase/lib/table";
import * as Urls from "metabase/lib/urls";

import S from "metabase/components/List.css";
import R from "metabase/reference/Reference.css";

import List from "metabase/components/List.jsx";
import ListItem from "metabase/components/ListItem.jsx";
import AdminAwareEmptyState from "metabase/components/AdminAwareEmptyState.jsx";

import LoadingAndErrorWrapper from "metabase/components/LoadingAndErrorWrapper.jsx";

import ReferenceHeader from "../components/ReferenceHeader.jsx";

import {
    getQuestionUrl
} from '../utils';


import {
    getSection,
    getData,
    getUser,
    getHasSingleSchema,
    getError,
    getLoading,
    getTableBySegment,
    getSegment
} from "../selectors";

import * as metadataActions from "metabase/redux/metadata";

const emptyStateData = (table, segment) =>{  
    return {
        message: "Questions about this segment will appear here as they're added",
        icon: "all",
        action: "Ask a question",
        link: getQuestionUrl({
            dbId: table && table.db_id,
            tableId: segment.table_id,
            segmentId: segment.id
        })
    };
}
const mapStateToProps = (state, props) => ({
    segment: getSegment(state,props),
    table: getTableBySegment(state,props),
    section: getSection(state, props),
    entities: getData(state, props),
    user: getUser(state, props),
    hasSingleSchema: getHasSingleSchema(state, props),
    loading: getLoading(state, props),
    loadingError: getError(state, props)
});

const mapDispatchToProps = {
    ...metadataActions
};

@connect(mapStateToProps, mapDispatchToProps)
export default class SegmentQuestions extends Component {
    static propTypes = {
        table: PropTypes.object.isRequired,
        segment: PropTypes.object.isRequired,
        style: PropTypes.object.isRequired,
        entities: PropTypes.object.isRequired,
        user: PropTypes.object.isRequired,
        section: PropTypes.object.isRequired,
        hasSingleSchema: PropTypes.bool,
        loading: PropTypes.bool,
        loadingError: PropTypes.object
    };

    render() {
        const {
            entities,
            user,
            style,
            section,
            hasSingleSchema,
            loadingError,
            loading
        } = this.props;

        return (
            <div style={style} className="full">
                <ReferenceHeader section={section} />
                <LoadingAndErrorWrapper loading={!loadingError && loading} error={loadingError}>
                { () => Object.keys(entities).length > 0 ?
                    <div className="wrapper wrapper--trim">
                        <List>
                            { 
                                Object.values(entities).filter(isQueryable).map((entity, index) =>
                                    entity && entity.id && entity.name &&
                                            <li className="relative" key={entity.id}>
                                                <ListItem
                                                    id={entity.id}
                                                    index={index}
                                                    name={entity.display_name || entity.name}
                                                    description={ `Created ${moment(entity.created_at).fromNow()} by ${entity.creator.common_name}` }
                                                    url={ Urls.question(entity.id) }
                                                    icon={ visualizations.get(entity.display).iconName }
                                                />
                                            </li>
                                )
                            }
                        </List>
                    </div>
                    :
                    <div className={S.empty}>
                        <AdminAwareEmptyState {...emptyStateData(this.props.table, this.props.segment)}/>
                    </div>
                }
                </LoadingAndErrorWrapper>
            </div>
        )
    }
}
